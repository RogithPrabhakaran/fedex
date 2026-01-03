const { sequelize } = require('./src/models');
const seedData = require('./seeds/seedData');

const runSeeds = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('Database synchronized.');
    
    await seedData();
    
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
};

runSeeds();
