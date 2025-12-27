// API Configuration and utilities
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'signin/index.html';
  }

  // Maintenance Request methods
  async getMaintenanceRequests() {
    return this.request('/maintenance');
  }

  async createMaintenanceRequest(data) {
    return this.request('/maintenance', {
      method: 'POST',
      body: data
    });
  }

  async updateMaintenanceRequest(id, data) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  // Test Activity methods
  async getUserTestActivities() {
    return this.request('/test-activity');
  }

  async getTestActivity(id) {
    return this.request(`/test-activity/${id}`);
  }

  async startTestActivity(requestId) {
    return this.request('/test-activity/start', {
      method: 'POST',
      body: { requestId }
    });
  }

  async updateTestProgress(id, progress, notes) {
    return this.request(`/test-activity/${id}/progress`, {
      method: 'PUT',
      body: { progress, notes }
    });
  }

  async completeTestActivity(id, score, feedback) {
    return this.request(`/test-activity/${id}/complete`, {
      method: 'PUT',
      body: { score, feedback }
    });
  }

  async lockTestActivity(id) {
    return this.request(`/test-activity/${id}/lock`, {
      method: 'PUT'
    });
  }

  // Equipment and Teams
  async getEquipment() {
    return this.request('/equipment');
  }

  async getTeams() {
    return this.request('/teams');
  }

  // Kanban board data
  async getKanbanData() {
    return this.request('/maintenance/kanban');
  }

  // Calendar data
  async getCalendarData() {
    return this.request('/maintenance/calendar');
  }

  // Equipment maintenance requests
  async getEquipmentMaintenance(equipmentId) {
    return this.request(`/maintenance/equipment/${equipmentId}`);
  }

  // Update request status
  async updateRequestStatus(id, status) {
    return this.request(`/maintenance/${id}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  // Assign technician
  async assignTechnician(requestId, technicianId) {
    return this.request(`/maintenance/${requestId}/assign`, {
      method: 'PUT',
      body: { technicianId }
    });
  }
}

// Global API instance
window.api = new ApiService();