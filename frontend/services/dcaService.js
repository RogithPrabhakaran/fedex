import { api } from './api';

export const dcaService = {
  async fetchAgencies(query = '') {
    return api.get(`/dca-agencies/agencies${query}`);
  },

  async fetchAgencyPerformance(agencyId) {
    return api.get(`/dca-agencies/agencies/${agencyId}/performance`);
  },

  async fetchPerformance(query = '') {
    return api.get(`/dca-agencies/performance${query}`);
  },

  async fetchCasesSummary(query = '') {
    return api.get(`/dca-agencies/cases-summary${query}`);
  },

  async getAgency(id) {
    return api.get(`/dca-agencies/agencies/${id}`);
  },

  async updateAgency(id, data) {
    return api.put(`/dca-agencies/agencies/${id}`, data);
  },

  async regenerateKey(id) {
    return api.post(`/dca-agencies/agencies/${id}/regenerate-key`);
  },

  async listAgents(id) {
    return api.get(`/dca-agencies/agencies/${id}/agents`);
  },

  async inviteAgent(id, payload) {
    return api.post(`/dca-agencies/agencies/${id}/agents`, payload);
  },

  async removeAgent(id, userId) {
    return api.delete(`/dca-agencies/agencies/${id}/agents/${userId}`);
  }
};
