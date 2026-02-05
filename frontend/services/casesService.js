import { api } from './api';

/**
 * DCA Cases Service
 * Handles all API calls related to case management for DCA Admins
 */

export const casesService = {
  /**
   * Get all cases for the logged-in DCA Admin
   * @returns {Promise<Array>} Array of cases with agent and invoice details
   */
  getAllCases: async () => {
    const response = await api.get('/cases');
    return response;
  },

  /**
   * Get case details by ID
   * @param {string} caseId - Case UUID
   * @returns {Promise<Object>} Case details with invoice, logs, and agent info
   */
  getCaseById: async (caseId) => {
    const response = await api.get(`/cases/${caseId}`);
    return response;
  },

  /**
   * Assign cases to an agent
   * @param {Array<string>} caseIds - Array of case UUIDs
   * @param {number} agentId - Agent ID (from dca_agents table)
   * @returns {Promise<Object>} Success message
   */
  assignCases: async (caseIds, agentId) => {
    const response = await api.post('/cases/assign', { caseIds, agentId });
    return response;
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats (total_cases, recovery_rate, charts data, etc.)
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response;
  },

  /**
   * Get case invoice details
   * @param {string} caseId - Case UUID
   * @returns {Promise<Object>} Invoice details
   */
  getCaseInvoice: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/invoice`);
    return response;
  },

  /**
   * Get case logs
   * @param {string} caseId - Case UUID
   * @returns {Promise<Array>} Array of case logs
   */
  getCaseLogs: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/logs`);
    return response;
  },

  /**
   * Create a new case log entry
   * @param {string} caseId - Case UUID
   * @param {Object} logData - Log data (action_type, description, etc.)
   * @returns {Promise<Object>} Created log entry
   */
  createCaseLog: async (caseId, logData) => {
    const response = await api.post(`/cases/${caseId}/logs`, logData);
    return response;
  },
};
