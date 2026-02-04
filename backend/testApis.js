const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test Cases API
    console.log('1. Testing GET /api/cases');
    const casesResponse = await axios.get(`${BASE_URL}/cases?limit=3`);
    console.log(`✅ Cases API working - Retrieved ${casesResponse.data.length} cases`);
    if (casesResponse.data.length > 0) {
      const firstCase = casesResponse.data[0];
      console.log(`   Sample case: ${firstCase.case_id} - Status: ${firstCase.status}, DCA: ${firstCase.dca_id || 'Unassigned'}`);
    }

    // Test Cases with filters
    console.log('\n2. Testing GET /api/cases?status=NEW');
    const newCasesResponse = await axios.get(`${BASE_URL}/cases?status=NEW`);
    console.log(`✅ Filter working - Found ${newCasesResponse.data.length} NEW cases`);

    // Test Cases by DCA
    console.log('\n3. Testing GET /api/cases/agency/DCA-AGILE-24');
    const dcaCasesResponse = await axios.get(`${BASE_URL}/cases/agency/DCA-AGILE-24`);
    console.log(`✅ DCA filter working - Found ${dcaCasesResponse.data.length} cases for DCA-AGILE-24`);

    // Test Invoices API
    console.log('\n4. Testing GET /api/invoices');
    const invoicesResponse = await axios.get(`${BASE_URL}/invoices?limit=3`);
    console.log(`✅ Invoices API working - Retrieved ${invoicesResponse.data.length} invoices`);
    if (invoicesResponse.data.length > 0) {
      const firstInvoice = invoicesResponse.data[0];
      console.log(`   Sample invoice: ${firstInvoice.invoice_id} - Amount: ${firstInvoice.total_amount}, Status: ${firstInvoice.payment_status}`);
    }

    // Test Overdue Invoices
    console.log('\n5. Testing GET /api/invoices/overdue');
    const overdueResponse = await axios.get(`${BASE_URL}/invoices/overdue`);
    console.log(`✅ Overdue filter working - Found ${overdueResponse.data.length} overdue invoices`);

    // Test Case Logs API
    console.log('\n6. Testing GET /api/case-logs');
    const logsResponse = await axios.get(`${BASE_URL}/case-logs?limit=5`);
    console.log(`✅ Case Logs API working - Retrieved ${logsResponse.data.length} logs`);
    if (logsResponse.data.length > 0) {
      const firstLog = logsResponse.data[0];
      console.log(`   Sample log: ${firstLog.action_type} by ${firstLog.actor}`);
    }

    // Test Case with Logs
    if (casesResponse.data.length > 0) {
      const caseId = casesResponse.data[0].case_id;
      console.log(`\n7. Testing GET /api/cases/${caseId}/logs`);
      const caseWithLogsResponse = await axios.get(`${BASE_URL}/cases/${caseId}/logs`);
      console.log(`✅ Case with logs working - Case has ${caseWithLogsResponse.data.logs?.length || 0} logs`);
    }

    console.log('\n✅ All API tests passed successfully!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIs();
