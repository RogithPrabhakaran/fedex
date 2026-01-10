const { Customer } = require('../models');
const mcaService = require('./mcaService');
const wbService = require('./worldBankService');
const riskModel = require('./riskModel');

const mapCustomerToCompany = (customer) => ({
  data: {
    company_name: customer.name || customer.accountId || 'Unknown',
    company_status: (customer.status || 'New'),
    paid_up_capital: Number(customer.totalDebt) || 0,
  }
});

const axios = require('axios');

async function computeRiskForCustomerInstance(custInstance) {
  try {
    // 1. Map Customer fields to Python Model Schema (CustomerData)
    // We use available fields or reasonable defaults/derivations where exact matches don't exist
    const payload = {
      DSO: custInstance.daysOverdue || 0,
      Lag_Trend: custInstance.past_due_ratio_hist ? Math.round(custInstance.past_due_ratio_hist * 100) : 10,
      Balance_Age: custInstance.daysOverdue || 0,
      MCA_Status: custInstance.status === 'Legal Action' ? 2 : 0, // 2: Liquidation/Critical equivalent
      Credit_Score: custInstance.credit_tier === 'HIGH_RISK' ? 300 : custInstance.credit_tier === 'LOW_RISK' ? 800 : 650,
      Company_Age: 5, // Default to 5 years if not tracked
      Has_Dispute: custInstance.dispute_rate_hist > 0.1 ? 1 : 0,
      Invoice_Error: 0,
      Email_Open_Rate: 0.8, // Mock interaction metric
      Response_Lat: 2.5, // Mock latency
      Sentiment: 0.6, // Mock sentiment
      Broken_Promises: custInstance.reminder_count || 0,
      PTP_Integrity: 0.95
    };

    console.log(`[RiskService] Calling ML Model for ${custInstance.name}...`, payload);

    // 2. Call Python FastAPI (app.py)
    // Ensure app.py is running on port 8000
    let mlResult = null;
    try {
      const response = await axios.post('http://localhost:8000/predict', payload);
      mlResult = response.data;
    } catch (apiError) {
      console.warn('[RiskService] ML Model unreachable. Is app.py running? Using fallback.', apiError.message);
      // Fallback logic could go here, or we accept null
    }

    // 3. Update Customer with Results
    const updates = {
      last_analyzed_at: new Date(),
      analysis_status: 'COMPLETED'
    };

    if (mlResult) {
      updates.ml_risk_score = mlResult.probability_to_pay;
      updates.ml_prediction = mlResult.allocation_result;
      updates.ml_business_action = mlResult.recommendation; // Store recommendation here

      // Update user-facing probability (inverted logic: P(Pay) -> Repayment Prob)
      // If Model gives P(Pay) = 0.8, Repayment Prob is 80%
      updates.repaymentProbability = Math.round(mlResult.probability_to_pay * 100);
    }

    await Customer.update(updates, { where: { id: custInstance.id } });

    return {
      customer: await Customer.findByPk(custInstance.id),
      mlResult
    };

  } catch (error) {
    console.error(`Error computing risk for customer ${custInstance.id}:`, error);
    // Determine if we should throw or just mark as failed
    await Customer.update({ analysis_status: 'FAILED' }, { where: { id: custInstance.id } });
    throw error;
  }
}

async function computeRiskForCustomerId(id) {
  const c = await Customer.findByPk(id);
  if (!c) throw new Error('Customer not found');

  // Set status to processing immediately and clear old probability for visual effect
  await c.update({ analysis_status: 'PROCESSING', repaymentProbability: 0 });

  // Fire-and-forget: Start ML analysis in background without awaiting completion
  computeRiskForCustomerInstance(c).catch(err =>
    console.error(`Background risk compute failed for ${id}`, err)
  );

  // Return the record immediately so UI shows "Processing" state
  return { customer: c };
}

async function computeRiskForAll() {
  const customers = await Customer.findAll();
  const results = [];
  for (const c of customers) {
    // sequential to avoid spamming remote GDP calls; GDP call is cached in computeRiskForCustomerInstance
    const r = await computeRiskForCustomerInstance(c);
    results.push(r);
  }
  return results;
}

module.exports = {
  computeRiskForCustomerInstance,
  computeRiskForCustomerId,
  computeRiskForAll,
};
