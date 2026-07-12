const API_BASE_URL = "https://419443gt-7262.euw.devtunnels.ms/api";

const handleResponse = async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json") || response.headers.get("content-type")?.includes("application/problem+json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = response.statusText;
    
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      } else if (data.errors) {
        // Handle ASP.NET Core Validation Problem details
        const errorMessages = [];
        for (const key in data.errors) {
          errorMessages.push(data.errors[key].join(" "));
        }
        errorMessage = errorMessages.join("\n");
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.title) {
        errorMessage = data.title;
      }
    }
    
    throw new Error(errorMessage || "حدث خطأ غير متوقع بالخادم");
  }

  return data;
};

export const authService = {
  // Login Endpoint
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/Account/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Register Endpoint
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/Account/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Check Availability
  checkEmail: async (email) => {
    const response = await fetch(`${API_BASE_URL}/Account/is-email-available?email=${encodeURIComponent(email)}`, {
      method: 'GET'
    });
    return handleResponse(response);
  },

  checkPhone: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/Account/is-phone-available?phoneNumber=${encodeURIComponent(phone)}`, {
      method: 'GET'
    });
    return handleResponse(response);
  },

  // OTP Endpoints
  sendOtp: async (email) => {
    const response = await fetch(`${API_BASE_URL}/Account/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  verifyOtp: async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/Account/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    return handleResponse(response);
  },

  // Password Reset Endpoints
  forgotPasswordSendOtp: async (email) => {
    const response = await fetch(`${API_BASE_URL}/Account/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (resetData) => {
    const response = await fetch(`${API_BASE_URL}/Account/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData)
    });
    return handleResponse(response);
  }
};
