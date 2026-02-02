/**
 * Settings controller
 *
 * Responsible for serving and updating global application settings stored
 * in the database (table: app_settings). Settings include risk thresholds,
 * notification rules, SLA definitions, commission defaults, and other
 * admin-configurable values.
 *
 * Endpoints implemented here are intentionally simple: the app uses a
 * single settings row (id=1) as the source of truth. Controllers are
 * written defensively to create the defaults row if it does not exist.
 */

const AppSettings = require('../models/AppSettings');

const settingsController = {
  /**
   * GET /api/settings
   * Return the full settings row. If the row does not exist, create it with defaults.
   */
  async getSettings(req, res) {
    try {
      let settings = await AppSettings.findOne({ where: { id: 1 } });
      if (!settings) {
        // create defaults
        settings = await AppSettings.create({ id: 1 });
      }
      res.json(settings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  },

  /**
   * PUT /api/settings
   * Update the global settings row. The endpoint accepts a JSON body that
   * will be shallow-merged into the existing settings row. Validation
   * is intentionally minimal here; callers (frontend) should validate inputs.
   */
  async updateSettings(req, res) {
    try {
      const payload = req.body;
      let settings = await AppSettings.findOne({ where: { id: 1 } });
      if (!settings) {
        settings = await AppSettings.create({ id: 1, ...payload });
        return res.json(settings);
      }

      await settings.update(payload);
      res.json(settings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  },

  /**
   * GET /api/settings/risk-thresholds
   * Convenience endpoint that returns only the risk_thresholds object, used by
   * the model runner to adapt thresholds without fetching all settings.
   */
  async getRiskThresholds(req, res) {
    try {
      let settings = await AppSettings.findOne({ where: { id: 1 } });
      if (!settings) settings = await AppSettings.create({ id: 1 });
      res.json({ risk_thresholds: settings.risk_thresholds });
    } catch (error) {
      console.error('Get risk thresholds error:', error);
      res.status(500).json({ error: 'Failed to fetch risk thresholds' });
    }
  },

  /**
   * GET /api/settings/sla-definitions
   * Return an object containing SLA definitions used across the app.
   */
  async getSlaDefinitions(req, res) {
    try {
      let settings = await AppSettings.findOne({ where: { id: 1 } });
      if (!settings) settings = await AppSettings.create({ id: 1 });
      res.json({ sla_definitions: settings.sla_definitions || {} });
    } catch (error) {
      console.error('Get SLA definitions error:', error);
      res.status(500).json({ error: 'Failed to fetch SLA definitions' });
    }
  },

  /**
   * PUT /api/settings/sla-definitions
   * Replace the SLA definitions object. The payload must contain a key
   * `sla_definitions` (object) - the frontend sends `{ list: [...] }`.
   */
  async updateSlaDefinitions(req, res) {
    try {
      const { sla_definitions } = req.body;
      if (!sla_definitions) return res.status(400).json({ error: 'sla_definitions required' });
      let settings = await AppSettings.findOne({ where: { id: 1 } });
      if (!settings) settings = await AppSettings.create({ id: 1 });
      await settings.update({ sla_definitions });
      res.json({ sla_definitions: settings.sla_definitions });
    } catch (error) {
      console.error('Update SLA definitions error:', error);
      res.status(500).json({ error: 'Failed to update SLA definitions' });
    }
  }
};

module.exports = settingsController;
