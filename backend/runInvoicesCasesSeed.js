require('dotenv').config();
const sequelize = require('./src/config/database');
const seedInvoicesCasesCaseLogs = require('./seeds/seedInvoicesCasesCaseLogs');

const runSeeds = async () => {
  try {
    console.log('🌱 Starting seed process...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Run the seed function
    await seedInvoicesCasesCaseLogs();

    console.log('\n✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  }
};

runSeeds();
