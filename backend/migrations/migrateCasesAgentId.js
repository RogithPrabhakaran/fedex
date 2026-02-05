    /**
 * Migration script to update Cases table agent_id from UUID to INTEGER
 * This is needed to reference the new dca_agents table instead of users table
 */

const { sequelize } = require('../src/models');

const migrateCasesAgentId = async () => {
  try {
    console.log('\n🔄 Starting migration: Cases.agent_id UUID -> INTEGER\n');

    // Step 1: Drop existing foreign key constraint
    console.log('1. Dropping existing foreign key constraint...');
    try {
      await sequelize.query('ALTER TABLE `cases` DROP FOREIGN KEY `cases_ibfk_6`;');
      console.log('   ✅ Foreign key dropped');
    } catch (error) {
      console.log('   ⚠️  Foreign key might not exist:', error.message);
    }

    // Step 2: Drop the agent_id column
    console.log('2. Dropping agent_id column...');
    try {
      await sequelize.query('ALTER TABLE `cases` DROP COLUMN `agent_id`;');
      console.log('   ✅ Column dropped');
    } catch (error) {
      console.log('   ⚠️  Column might not exist:', error.message);
    }

    // Step 3: Add agent_id column as INTEGER
    console.log('3. Adding agent_id column as INTEGER...');
    await sequelize.query(`
      ALTER TABLE \`cases\` 
      ADD COLUMN \`agent_id\` INT NULL 
      COMMENT 'Assigned DCA agent working on this case (references dca_agents table)';
    `);
    console.log('   ✅ Column added');

    // Step 4: Add foreign key constraint to dca_agents table
    console.log('4. Adding foreign key constraint to dca_agents...');
    await sequelize.query(`
      ALTER TABLE \`cases\` 
      ADD CONSTRAINT \`cases_agent_fk\` 
      FOREIGN KEY (\`agent_id\`) 
      REFERENCES \`dca_agents\` (\`id\`) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);
    console.log('   ✅ Foreign key added');

    console.log('\n✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  migrateCasesAgentId()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = migrateCasesAgentId;
