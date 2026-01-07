/**
 * Migration script to add new fields to customers table
 * Run this once to update existing database schema
 * 
 * Usage: node scripts/addCustomerFields.js
 */

require('dotenv').config();
const { sequelize } = require('../src/models');
const { QueryTypes } = require('sequelize');

async function addCustomerFields() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Adding new fields to customers table...');
    
    // Add new fields one by one (MySQL doesn't support adding multiple columns in one ALTER)
    const fields = [
      { name: 'cin', type: 'VARCHAR(255) NULL' },
      { name: 'invoice_amount', type: 'DECIMAL(12, 2) NULL' },
      { name: 'payment_terms_days', type: 'INT NULL DEFAULT 30' },
      { name: 'service_type', type: "ENUM('EXPRESS', 'GROUND', 'FREIGHT', 'INTERNATIONAL') NULL DEFAULT 'GROUND'" },
      { name: 'recent_shipments_30d', type: 'INT NULL DEFAULT 0' },
      { name: 'recent_shipments_90d', type: 'INT NULL DEFAULT 0' },
      { name: 'ontime_delivery_rate_hist', type: 'DECIMAL(5, 4) NULL DEFAULT 0.9' },
      { name: 'delivery_exceptions_90d', type: 'INT NULL DEFAULT 0' },
      { name: 'past_due_ratio_hist', type: 'DECIMAL(5, 4) NULL DEFAULT 0' },
      { name: 'dispute_rate_hist', type: 'DECIMAL(5, 4) NULL DEFAULT 0' },
      { name: 'reminder_count', type: 'INT NULL DEFAULT 0' },
      { name: 'credit_tier', type: "ENUM('LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK') NULL DEFAULT 'MEDIUM_RISK'" },
      { name: 'credit_limit', type: 'DECIMAL(12, 2) NULL DEFAULT 0' },
      { name: 'outstanding_balance', type: 'DECIMAL(12, 2) NULL DEFAULT 0' },
      { name: 'utilization_at_invoice', type: 'DECIMAL(5, 4) NULL DEFAULT 0' },
      { name: 'ml_risk_score', type: 'DECIMAL(5, 4) NULL' },
      { name: 'ml_risk_category', type: 'VARCHAR(255) NULL' },
      { name: 'ml_business_action', type: 'VARCHAR(255) NULL' },
      { name: 'ml_prediction', type: 'VARCHAR(255) NULL' },
      { name: 'risk_score', type: 'DECIMAL(5, 2) NULL' },
      { name: 'risk_verdict', type: 'VARCHAR(255) NULL' },
      { name: 'risk_action', type: 'VARCHAR(255) NULL' },
      { name: 'last_analyzed_at', type: 'DATETIME NULL' },
      { name: 'analysis_status', type: "ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NULL DEFAULT 'PENDING'" },
    ];

    for (const field of fields) {
      try {
        // Check if column already exists
        const [results] = await sequelize.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'customers' 
           AND COLUMN_NAME = '${field.name}'`,
          { type: QueryTypes.SELECT }
        );

        if (results.count > 0) {
          console.log(`  ✓ Column '${field.name}' already exists, skipping...`);
          continue;
        }

        // Add column
        await sequelize.query(
          `ALTER TABLE customers ADD COLUMN ${field.name} ${field.type}`,
          { type: QueryTypes.RAW }
        );
        console.log(`  ✓ Added column '${field.name}'`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`  ✓ Column '${field.name}' already exists, skipping...`);
        } else {
          console.error(`  ✗ Error adding column '${field.name}':`, error.message);
        }
      }
    }

    // Update existing customers with default values
    console.log('\nUpdating existing customers with default values...');
    await sequelize.query(`
      UPDATE customers 
      SET 
        invoice_amount = COALESCE(invoice_amount, totalDebt),
        payment_terms_days = COALESCE(payment_terms_days, 30),
        service_type = COALESCE(service_type, 'GROUND'),
        ontime_delivery_rate_hist = COALESCE(ontime_delivery_rate_hist, 0.9),
        past_due_ratio_hist = COALESCE(past_due_ratio_hist, LEAST(1, daysOverdue / 120.0)),
        credit_tier = COALESCE(credit_tier, 
          CASE 
            WHEN repaymentProbability >= 70 THEN 'LOW_RISK'
            WHEN repaymentProbability >= 40 THEN 'MEDIUM_RISK'
            ELSE 'HIGH_RISK'
          END
        ),
        outstanding_balance = COALESCE(outstanding_balance, totalDebt),
        credit_limit = COALESCE(credit_limit, totalDebt * 3),
        utilization_at_invoice = COALESCE(utilization_at_invoice, 
          LEAST(2, COALESCE(outstanding_balance, totalDebt) / NULLIF(credit_limit, 0))
        ),
        analysis_status = COALESCE(analysis_status, 'PENDING')
      WHERE invoice_amount IS NULL 
         OR payment_terms_days IS NULL 
         OR service_type IS NULL
    `, { type: QueryTypes.RAW });
    
    console.log('  ✓ Updated existing customer records');
    console.log('\n✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addCustomerFields();
