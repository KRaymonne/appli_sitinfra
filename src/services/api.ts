import api from '../api';

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Business API
export const businessApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/businesses');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/businesses', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/businesses/${id}`);
    return response.data;
  }
};

// Contacts API
export const contactsApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/contacts');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  }
};

// Employees API
export const employeesApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/employees');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

// Invoices API
export const invoicesApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/invoices');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  }
};

// Vehicles API
export const vehiclesApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

// Equipment API
export const equipmentApi = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/equipment');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  }
};

// Utility function to check API health
export const checkApiHealth = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: 'Cannot connect to API server'
    };
  }
};

export default api;