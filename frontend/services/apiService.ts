const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    return data.user;
  }

  async register(userData: any) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    return data.user;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Customer methods
  async getCustomers(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/customers${params ? `?${params}` : ''}`);
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customerData: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: string, customerData: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async assignToDca(customerId: string, dcaId: string) {
    return this.request(`/customers/${customerId}/assign-dca`, {
      method: 'POST',
      body: JSON.stringify({ dcaId }),
    });
  }

  // DCA Action methods
  async createAction(customerId: string, actionData: any) {
    return this.request(`/dca/customers/${customerId}/actions`, {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  async getCustomerActions(customerId: string) {
    return this.request(`/dca/customers/${customerId}/actions`);
  }

  async updateAction(actionId: string, actionData: any) {
    return this.request(`/dca/actions/${actionId}`, {
      method: 'PUT',
      body: JSON.stringify(actionData),
    });
  }

  async deleteAction(actionId: string) {
    return this.request(`/dca/actions/${actionId}`, {
      method: 'DELETE',
    });
  }

  // Email methods
  async getEmailTemplates() {
    return this.request('/emails/templates');
  }

  async getEmailTemplate(id: string) {
    return this.request(`/emails/templates/${id}`);
  }

  async createEmailTemplate(templateData: any) {
    return this.request('/emails/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateEmailTemplate(id: string, templateData: any) {
    return this.request(`/emails/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteEmailTemplate(id: string) {
    return this.request(`/emails/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async sendEmail(emailData: any) {
    return this.request('/emails/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }
}

export const apiService = new ApiService();
