/**
 * Check if database has data, and seed if empty
 * This script safely adds data without dropping existing tables
 * 
 * Usage: node scripts/checkAndSeed.js
 */

require('dotenv').config();
const { sequelize, Customer, User, EmailTemplate, DcaAction } = require('../src/models');
const seedData = require('../seeds/seedData');

async function checkAndSeed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    // Sync models (creates tables if they don't exist, but doesn't drop)
    await sequelize.sync({ force: false });
    console.log('✓ Database synchronized.');

    // Check if we have any customers
    const customerCount = await Customer.count();
    const userCount = await User.count();

    console.log(`\nCurrent database state:`);
    console.log(`  Customers: ${customerCount}`);
    console.log(`  Users: ${userCount}`);

    if (customerCount === 0 && userCount === 0) {
      console.log('\n⚠ Database is empty. Seeding data...\n');
      await seedData();
      console.log('\n✓ Seed data created successfully!');
      
      // Verify
      const newCustomerCount = await Customer.count();
      const newUserCount = await User.count();
      console.log(`\n✓ Verification:`);
      console.log(`  Customers: ${newCustomerCount}`);
      console.log(`  Users: ${newUserCount}`);
    } else {
      console.log('\n✓ Database already has data. Skipping seed.');
      console.log('  To reset and reseed, run: node runSeeds.js');
    }

    console.log('\n✓ Done!');
    
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run check and seed
checkAndSeed();
