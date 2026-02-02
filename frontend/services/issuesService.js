import { api } from './api';

export const issuesService = {
  async list(query = '') {
    return api.get(`/issues${query}`);
  },
  async get(id) {
    return api.get(`/issues/${id}`);
  },
  async create(payload) {
    return api.post(`/issues`, payload);
  },
  async update(id, payload) {
    return api.put(`/issues/${id}`, payload);
  },
  async remove(id) {
    return api.del(`/issues/${id}`);
  },

  // Comments
  async listComments(issueId) {
    return api.get(`/issues/${issueId}/comments`);
  },

  async createComment(issueId, payload) {
    return api.post(`/issues/${issueId}/comments`, payload);
  }
};
