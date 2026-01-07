const { Customer } = require('../models');
const mcaService = require('./mcaService');
const wbService = require('./worldBankService');
const riskModel = require('./riskModel');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Build ML model input from customer data
 */
function buildModelInput(customer) {
  return {
    invoice_amount: Number(customer.invoice_amount || customer.totalDebt || 0),
    payment_terms_days: customer.payment_terms_days || 30,
    service_type: customer.service_type || 'GROUND',
    recent_shipments_30d: customer.recent_shipments_30d || 0,
    recent_shipments_90d: customer.recent_shipments_90d || 0,
    ontime_delivery_rate_hist: Number(customer.ontime_delivery_rate_hist || 0.9),
    delivery_exceptions_90d: customer.delivery_exceptions_90d || 0,
    past_due_ratio_hist: Number(customer.past_due_ratio_hist || Math.min(1, (customer.daysOverdue || 0) / 120)),
    dispute_rate_hist: Number(customer.dispute_rate_hist || 0),
    reminder_count: customer.reminder_count || 0,
    credit_tier: customer.credit_tier || 'MEDIUM_RISK',
    credit_limit: Number(customer.credit_limit || 0),
    outstanding_balance: Number(customer.outstanding_balance || customer.totalDebt || 0),
    utilization_at_invoice: Number(customer.utilization_at_invoice || 0),
  };
}

/**
 * Run ML model prediction
 */
async function runMLModel(modelInput) {
  return new Promise((resolve, reject) => {
    const pyPath = path.resolve(__dirname, '../../predict.py');
    
    const candidates = [
      path.resolve(__dirname, '../../.venv/bin/python'),
      path.resolve(__dirname, '../../../.venv/bin/python'),
      'python3'
    ];
    const pythonExec = candidates.find(p => typeof p === 'string' && fs.existsSync(p)) || 'python3';

    const child = execFile(
      pythonExec,
      [pyPath],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          console.error('ML Model execution error:', err.message);
          const stderrStr = stderr?.toString() || '';
          console.error('Python stderr:', stderrStr);
          return reject(new Error(`Model execution failed: ${stderrStr}`));
        }

        if (!stdout || stdout.trim().length === 0) {
          return reject(new Error('Model returned empty output'));
        }

        try {
          const out = JSON.parse(stdout);
          if (!out.success) {
            return reject(new Error(out.message || 'Model prediction failed'));
          }
          resolve(out);
        } catch (e) {
          console.error('Invalid JSON from model:', e.message);
          console.error('Model stdout:', stdout.substring(0, 500));
          reject(new Error('Invalid model output'));
        }
      }
    );

    child.on('error', (err) => {
      reject(new Error(`Failed to start model process: ${err.message}`));
    });

    child.stdin.write(JSON.stringify(modelInput));
    child.stdin.end();
  });
}

/**
 * Complete customer analysis workflow
 * 1. Fetch customer from DB
 * 2. Check for missing data (CIN, etc.)
 * 3. Fetch API data (MCA service)
 * 4. Update customer with API data if needed
 * 5. Run ML model
 * 6. Run risk model
 * 7. Update database
 * 8. Return results
 */
async function analyzeCustomer(customerId) {
  try {
    // Step 1: Fetch customer from database
    let customer = await Customer.findByPk(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Step 2: Update analysis status
    await Customer.update(
      { analysis_status: 'PROCESSING', last_analyzed_at: new Date() },
      { where: { id: customerId } }
    );

    // Step 3: Check for CIN and fetch MCA data if available
    let mcaData = null;
    if (customer.cin) {
      try {
        mcaData = await mcaService.getCompanyData(customer.cin);
        if (mcaData && mcaData.data) {
          // Update customer with MCA data if available
          const updates = {};
          if (mcaData.data.paid_up_capital && !customer.credit_limit) {
            updates.credit_limit = mcaData.data.paid_up_capital;
          }
          if (Object.keys(updates).length > 0) {
            await Customer.update(updates, { where: { id: customerId } });
            customer = await Customer.findByPk(customerId); // Refresh
          }
        }
      } catch (error) {
        console.error(`Error fetching MCA data for customer ${customerId}:`, error.message);
        // Continue without MCA data
      }
    }

    // Step 4: Ensure customer has all required fields for ML model
    // If missing, use defaults based on existing data
    const modelInput = buildModelInput(customer);
    
    // Update customer with defaults if fields are missing
    const missingFields = {};
    if (!customer.invoice_amount && customer.totalDebt) {
      missingFields.invoice_amount = customer.totalDebt;
    }
    if (!customer.payment_terms_days) {
      missingFields.payment_terms_days = 30;
    }
    if (!customer.service_type) {
      missingFields.service_type = 'GROUND';
    }
    if (!customer.ontime_delivery_rate_hist) {
      missingFields.ontime_delivery_rate_hist = 0.9;
    }
    if (!customer.past_due_ratio_hist && customer.daysOverdue) {
      missingFields.past_due_ratio_hist = Math.min(1, customer.daysOverdue / 120);
    }
    if (!customer.credit_tier) {
      // Determine credit tier based on repayment probability
      if (customer.repaymentProbability >= 70) {
        missingFields.credit_tier = 'LOW_RISK';
      } else if (customer.repaymentProbability >= 40) {
        missingFields.credit_tier = 'MEDIUM_RISK';
      } else {
        missingFields.credit_tier = 'HIGH_RISK';
      }
    }
    if (!customer.outstanding_balance && customer.totalDebt) {
      missingFields.outstanding_balance = customer.totalDebt;
    }
    if (!customer.credit_limit && customer.totalDebt) {
      missingFields.credit_limit = customer.totalDebt * 3; // Default 3x debt
    }
    if (customer.credit_limit && customer.outstanding_balance) {
      missingFields.utilization_at_invoice = Math.min(2, 
        Number(customer.outstanding_balance) / Number(customer.credit_limit || 1)
      );
    }

    if (Object.keys(missingFields).length > 0) {
      await Customer.update(missingFields, { where: { id: customerId } });
      customer = await Customer.findByPk(customerId); // Refresh
    }

    // Step 5: Run ML Model
    let mlResult = null;
    try {
      const finalModelInput = buildModelInput(customer);
      mlResult = await runMLModel(finalModelInput);
      
      // Update customer with ML model results
      await Customer.update({
        ml_risk_score: mlResult.risk_score,
        ml_risk_category: mlResult.risk_category,
        ml_business_action: mlResult.business_action,
        ml_prediction: mlResult.prediction,
      }, { where: { id: customerId } });
    } catch (error) {
      console.error(`ML Model failed for customer ${customerId}:`, error.message);
      // Continue with risk model even if ML model fails
    }

    // Step 6: Get GDP data for risk model
    const gdp = await wbService.getCountryGDP('IND');
    
    // Step 7: Prepare company data for risk model
    let company = null;
    if (customer.cin && mcaData) {
      company = mcaData;
    } else {
      // Map customer to company format
      company = {
        data: {
          company_name: customer.name || customer.accountId || 'Unknown',
          company_status: customer.status || 'New',
          paid_up_capital: Number(customer.credit_limit || customer.totalDebt || 0),
        }
      };
    }

    // Step 8: Run Risk Model
    const riskAnalysis = riskModel.calculateRisk(company, gdp || 0);
    
    // Step 9: Calculate final repayment probability
    // Combine ML model score and risk model score
    let finalRepaymentProbability = customer.repaymentProbability || 50;
    
    if (mlResult && mlResult.risk_score !== undefined) {
      // ML model gives probability of ON_TIME payment (0-1)
      // Convert to repayment probability (0-100)
      finalRepaymentProbability = Math.round(mlResult.risk_score * 100);
    }
    
    // Adjust based on risk model
    const riskAdjustment = Math.max(0, 100 - Math.round(riskAnalysis.score));
    finalRepaymentProbability = Math.round((finalRepaymentProbability * 0.7) + (riskAdjustment * 0.3));
    finalRepaymentProbability = Math.max(0, Math.min(100, finalRepaymentProbability));

    // Step 10: Update customer with all results
    const noteEntry = `\n[Analysis ${new Date().toISOString()}] ML:${mlResult?.risk_score || 'N/A'} Risk:${riskAnalysis.score} Verdict:${riskAnalysis.verdict} Action:${riskAnalysis.action}`;
    const notes = (customer.notes || '') + noteEntry;

    await Customer.update({
      repaymentProbability: finalRepaymentProbability,
      risk_score: riskAnalysis.score,
      risk_verdict: riskAnalysis.verdict,
      risk_action: riskAnalysis.action,
      analysis_status: 'COMPLETED',
      last_analyzed_at: new Date(),
      notes,
    }, { where: { id: customerId } });

    // Step 11: Return updated customer with all results
    const updatedCustomer = await Customer.findByPk(customerId);
    
    return {
      success: true,
      customer: updatedCustomer,
      mlResult,
      riskAnalysis,
      finalRepaymentProbability,
    };
  } catch (error) {
    console.error(`Error analyzing customer ${customerId}:`, error);
    
    // Update status to failed
    await Customer.update(
      { analysis_status: 'FAILED' },
      { where: { id: customerId } }
    ).catch(() => {}); // Ignore errors if update fails
    
    throw error;
  }
}

/**
 * Analyze all customers
 */
async function analyzeAllCustomers() {
  const customers = await Customer.findAll();
  const results = [];
  
  for (const customer of customers) {
    try {
      const result = await analyzeCustomer(customer.id);
      results.push(result);
    } catch (error) {
      console.error(`Failed to analyze customer ${customer.id}:`, error.message);
      results.push({
        success: false,
        customerId: customer.id,
        error: error.message,
      });
    }
  }
  
  return results;
}

module.exports = {
  analyzeCustomer,
  analyzeAllCustomers,
  buildModelInput,
};
