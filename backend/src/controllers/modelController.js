const { execFile } = require('child_process');
const path = require('path');
const Joi = require('joi');

const modelInputSchema = Joi.object({
  invoice_amount: Joi.number().required(),
  payment_terms_days: Joi.number().required(),
  service_type: Joi.string().valid('EXPRESS','GROUND','FREIGHT','INTERNATIONAL').required(),
  recent_shipments_30d: Joi.number().required(),
  recent_shipments_90d: Joi.number().required(),
  ontime_delivery_rate_hist: Joi.number().min(0).max(1).required(),
  delivery_exceptions_90d: Joi.number().required(),
  past_due_ratio_hist: Joi.number().min(0).max(1).required(),
  dispute_rate_hist: Joi.number().min(0).max(1).required(),
  reminder_count: Joi.number().required(),
  credit_tier: Joi.string().valid('LOW_RISK','MEDIUM_RISK','HIGH_RISK').required(),
  credit_limit: Joi.number().required(),
  outstanding_balance: Joi.number().required(),
  utilization_at_invoice: Joi.number().min(0).max(2).required()
});

const modelController = {
  predict(req, res) {
    const { error, value } = modelInputSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const pyPath = path.resolve(__dirname, '../../predict.py');

    // Prefer virtualenv python if present so packages installed in venv are used
    const fs = require('fs');
    const candidates = [
      path.resolve(__dirname, '../../.venv/bin/python'), // backend/.venv
      path.resolve(__dirname, '../../../.venv/bin/python'), // project-root .venv
      'python3'
    ];
    const pythonExec = candidates.find(p => typeof p === 'string' && fs.existsSync(p)) || 'python3';
    console.debug('Using python executable for model:', pythonExec);

    const child = execFile(pythonExec, [pyPath], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Model execution error', err, stderr);
        // attempt to return Python stderr to help debugging if present
        return res.status(500).json({ error: 'Model execution failed', detail: stderr?.toString?.() });
      }

      try {
        const out = JSON.parse(stdout);
        // ensure exact output format
        return res.json(out);
      } catch (e) {
        console.error('Invalid JSON from model', e);
        return res.status(500).json({ error: 'Invalid model output' });
      }
    });

    // pass JSON input via stdin
    child.stdin.write(JSON.stringify(value));
    child.stdin.end();
  }
};

module.exports = modelController;
