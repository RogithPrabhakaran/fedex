const fs = require('fs');
const path = require('path');

// To swap later: Replace this function with a Surepass API call
const getCompanyData = async (cin) => {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/mock-mca.json'));
    const mockDb = JSON.parse(rawData);
    
    return mockDb[cin] || null;
};

module.exports = { getCompanyData };