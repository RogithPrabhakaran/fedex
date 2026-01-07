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

async function computeRiskForCustomerInstance(custInstance) {
  try {
    const gdp = await wbService.getCountryGDP('IND');
    let company = null;
    if (custInstance.cin) {
      company = await mcaService.getCompanyData(custInstance.cin);
    }
    if (!company) company = mapCustomerToCompany(custInstance);

    const analysis = riskModel.calculateRisk(company, gdp || 0);
    const repaymentProbability = Math.max(0, Math.min(100, 100 - Math.round(analysis.score)));
    const noteEntry = `\n[RiskCheck ${new Date().toISOString()}] score:${analysis.score} verdict:${analysis.verdict} action:${analysis.action}`;
    const notes = (custInstance.notes || '') + noteEntry;

    await Customer.update({ repaymentProbability, notes }, { where: { id: custInstance.id } });
    const fresh = await Customer.findByPk(custInstance.id);
    return { customer: fresh, analysis };
  } catch (error) {
    console.error(`Error computing risk for customer ${custInstance.id}:`, error);
    throw error;
  }
}

async function computeRiskForCustomerId(id) {
  const c = await Customer.findByPk(id);
  if (!c) throw new Error('Customer not found');
  return computeRiskForCustomerInstance(c);
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
