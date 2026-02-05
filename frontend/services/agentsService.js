import { api } from './api';

/**
 * DCA Agents Service
 * Handles all API calls related to DCA agent management
 */

export const agentsService = {
  /**
   * Get all agents for the logged-in DCA Admin
   * @returns {Promise<Array>} Array of agents with stats
   */
  getAllAgents: async () => {
    return api.get('/dca/agents');
  },

  /**
   * Create a new agent
   * @param {Object} agentData - Agent data (name, email, phone, sendLoginEmail)
   * @returns {Promise<Object>} Created agent
   */
  createAgent: async (agentData) => {
    return api.post('/dca/agents', agentData);
  },

  /**
   * Update an existing agent
   * @param {number} id - Agent ID
   * @param {Object} agentData - Updated agent data
   * @returns {Promise<Object>} Updated agent
   */
  updateAgent: async (id, agentData) => {
    return api.put(`/dca/agents/${id}`, agentData);
  },

  /**
   * Delete an agent
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Success message
   */
  deleteAgent: async (id) => {
    return api.del(`/dca/agents/${id}`);
  },

  /**
   * Get agent statistics
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Agent stats (total_cases, active_cases, recovery_rate, etc.)
   */
  getAgentStats: async (id) => {
    return api.get(`/dca/agents/${id}/stats`);
  },

  /**
   * Get agent progress data (for progress modal)
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Agent progress data with charts and activity
   */
  getAgentProgress: async (id) => {
    return api.get(`/dca/agents/${id}/progress`);
  },
};
