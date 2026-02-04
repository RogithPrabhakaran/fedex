import { api } from './api';

export const dashboardService = {
  async fetchAgencies(query = '') {
    return api.get(`/dca-agencies/agencies${query}`);
  },

  async fetchCustomers(query = '') {
    return api.get(`/customers${query}`);
  },

  async fetchCases(query = '') {
    return api.get(`/cases${query}`);
  },

  async fetchCasesSummary(query = '') {
    return api.get(`/dca-agencies/cases-summary${query}`);
  }
};
