/*
  Script: apply_model_to_customers.js
  - Fetches all customers (requires admin token set in ADMIN_TOKEN env var)
  - Calls POST /api/model/predict for each customer with a best-effort mapping
  - Updates each customer with repaymentProbability = Math.round(risk_score * 100)
  - Prints a summary
*/

const fetch = global.fetch || require('node-fetch');

const API = process.env.API_BASE || 'http://127.0.0.1:5000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('Please set ADMIN_TOKEN env var (JWT for a user with admin role).');
  process.exit(1);
}

const headers = (isJson = true) => ({
  ...(isJson ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${ADMIN_TOKEN}`,
});

(async () => {
  try {
    const customersRes = await fetch(`${API}/customers`, { headers: headers() });
    if (!customersRes.ok) throw new Error('Failed to fetch customers ' + customersRes.status);
    const customers = await customersRes.json();

    console.log(`Found ${customers.length} customers. Running model predictions...`);

    const results = [];
    for (const c of customers) {
      // build model input (best-effort)
      const input = {
        invoice_amount: Number(c.totalDebt) || 0,
        payment_terms_days: 30,
        service_type: 'GROUND',
        recent_shipments_30d: 0,
        recent_shipments_90d: 0,
        ontime_delivery_rate_hist: 0.9,
        delivery_exceptions_90d: 0,
        past_due_ratio_hist: Math.min(1, (c.daysOverdue || 0) / 120),
        dispute_rate_hist: 0,
        reminder_count: 0,
        credit_tier: 'MEDIUM_RISK',
        credit_limit: Number(c.creditLimit) || 0,
        outstanding_balance: Number(c.totalDebt) || 0,
        utilization_at_invoice: 0
      };

      const predRes = await fetch(`${API}/model/predict`, { method: 'POST', headers: headers(), body: JSON.stringify(input) });
      if (!predRes.ok) {
        console.warn(`Model call failed for ${c.id} (${c.name}) status ${predRes.status}`);
        continue;
      }
      const pred = await predRes.json();
      if (!pred.success) {
        console.warn(`Model returned success=false for ${c.id} (${c.name})`, pred);
        continue;
      }

      const pct = Math.round(pred.risk_score * 100);
      const updRes = await fetch(`${API}/customers/${c.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ repaymentProbability: pct }) });
      if (!updRes.ok) {
        console.warn(`Update failed for ${c.id} status=${updRes.status}`);
        continue;
      }
      const updated = await updRes.json();
      results.push({ id: c.id, name: c.name, repaymentProbability: updated.repaymentProbability, modelScore: pred.risk_score, risk_category: pred.risk_category });
      console.log(`Updated ${c.id} ${c.name} -> ${updated.repaymentProbability}% (score ${pred.risk_score})`);
    }

    console.log('\nSummary:');
    console.table(results.map(r => ({ id: r.id, name: r.name, repaymentProbability: r.repaymentProbability, risk_score: r.modelScore, risk_category: r.risk_category })));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
