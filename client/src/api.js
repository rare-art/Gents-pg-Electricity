const API_BASE = '/api';

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    const token = localStorage.getItem('gentspg_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },
  
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    if (!res.ok) return null;
    return await res.json();
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  },

  verifyOtp: async (email, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');
    return data;
  },

  resetPassword: async (resetToken, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ resetToken, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Password reset failed');
    return data;
  },

  // Summary Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats/summary`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
  },

  // Residents
  getResidents: async () => {
    const res = await fetch(`${API_BASE}/residents`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch residents');
    return data;
  },

  addResident: async (residentData) => {
    const res = await fetch(`${API_BASE}/residents`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(residentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add resident');
    return data;
  },

  updateResident: async (id, residentData) => {
    const res = await fetch(`${API_BASE}/residents/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(residentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update resident');
    return data;
  },

  deleteResident: async (id) => {
    const res = await fetch(`${API_BASE}/residents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete resident');
    return data;
  },

  // Meters
  getMeters: async () => {
    const res = await fetch(`${API_BASE}/meters`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch meters');
    return data;
  },

  addMeter: async (meterData) => {
    const res = await fetch(`${API_BASE}/meters`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(meterData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add meter');
    return data;
  },

  updateMeter: async (id, meterData) => {
    const res = await fetch(`${API_BASE}/meters/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(meterData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update meter');
    return data;
  },

  deleteMeter: async (id) => {
    const res = await fetch(`${API_BASE}/meters/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete meter');
    return data;
  },

  // Bills
  getBills: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/bills?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bills');
    return data;
  },

  getBillDetails: async (id) => {
    const res = await fetch(`${API_BASE}/bills/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bill details');
    return data;
  },

  createBill: async (billData) => {
    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(billData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create bill');
    return data;
  },

  deleteBill: async (id) => {
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete bill');
    return data;
  },

  // Payments
  getPayments: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/payments?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');
    return data;
  },

  getResidentPayments: async (residentId) => {
    const res = await fetch(`${API_BASE}/payments/resident/${residentId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch resident ledger');
    return data;
  },

  updatePaymentStatus: async (paymentId, payload) => {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update payment status');
    return data;
  }
};
