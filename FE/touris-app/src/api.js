import axios from 'axios';

// Empty => same origin (unified hosting / nginx proxy)
const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function shouldRetry(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const isHtml = typeof data === 'string' && /bad gateway|<!doctype|<html/i.test(data);
  return status === 502 || status === 503 || status === 504 || isHtml || error?.code === 'ECONNABORTED';
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    // Free Render cold-start: retry a couple of times automatically
    if (shouldRetry(error) && config.__retryCount < 2) {
      config.__retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 1500 * config.__retryCount));
      return api(config);
    }

    return Promise.reject(error);
  },
);

export default api;
