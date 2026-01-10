
require('dotenv').config();
const {
    sequelize,
    User,
    Customer,
    Invoice,
    DcaAction,
    DcaAgency,
    Case
} = require('../src/models');

const checkDb = async () => {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected to Database.');

        console.log('Counting rows...');
        const userCount = await User.count();
        const customerCount = await Customer.count();
        const invoiceCount = await Invoice.count();
        const actionCount = await DcaAction.count();
        const agencyCount = await DcaAgency.count();
        const caseCount = await Case.count();

        console.log('--- Database Counts ---');
        console.log(`Users: ${userCount}`);
        console.log(`Customers: ${customerCount}`);
        console.log(`Invoices: ${invoiceCount}`);
        console.log(`DCA Actions: ${actionCount}`);
        console.log(`DCA Agencies: ${agencyCount}`);
        console.log(`Cases: ${caseCount}`);
        console.log('-----------------------');

        process.exit(0);
    } catch (error) {
        console.error('Check DB failed:', error);
        process.exit(1);
    }
};

checkDb();
