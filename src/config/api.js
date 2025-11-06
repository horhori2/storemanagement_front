// src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    GAMES: '/games/',
    CARD_SETS: '/sets/',
    CARDS: '/cards/',
    CARD_VERSIONS: '/card-versions/',
    INVENTORY: '/inventory/',
    SALES: '/sales/'
  }
};

// API 공통 함수
class ApiClient {
  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET 요청
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST 요청
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 요청
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 요청
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// 여러 환경 변수 관리
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
  apiTimeout: process.env.REACT_APP_API_TIMEOUT || 5000,
  environment: process.env.NODE_ENV,
};

export const apiClient = new ApiClient();