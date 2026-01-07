import { api } from './api';

export const customerService = {
  async fetchAll(query = '') {
    // query should start with ? if provided
    return api.get(`/customers${query}`);
  },

  async fetchById(id) {
    return api.get(`/customers/${id}`);
  },

  async updateCustomer(id, body) {
    return api.put(`/customers/${id}`, body);
  },

  async createCustomer(body) {
    return api.post(`/customers`, body);
  },

  async deleteCustomer(id) {
    return api.del(`/customers/${id}`);
  },

  async assignToDca(id, dcaId) {
    return api.post(`/customers/${id}/assign-dca`, { dcaId });
  },

  async assignToDcaBulk(customerIds, dcaId) {
    return api.post(`/customers/assign-bulk`, { customerIds, dcaId });
  },

  async fetchAssigned(dcaId) {
    const q = dcaId ? `?dcaId=${encodeURIComponent(dcaId)}` : '';
    return api.get(`/customers/assigned${q}`);
  },

  async addAction(customerId, action) {
    return api.post(`/dca/customers/${customerId}/actions`, action);
  },

  // New comprehensive analysis endpoint (recommended)
  async analyzeCustomer(id) {
    return api.post(`/v1/customers/${id}/analyze`);
  },

  // Analyze all customers
  async analyzeAllCustomers() {
    return api.post('/v1/analyze-all');
  },

  // Legacy endpoints (kept for backward compatibility)
  async computeRiskAll() {
    return api.post('/v1/compute-risk-all');
  },

  async computeRiskForCustomer(id) {
    return api.post(`/v1/customers/${id}/compute-risk`);
  }
};
