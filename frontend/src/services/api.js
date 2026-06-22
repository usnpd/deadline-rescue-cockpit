import axios from 'axios';

// Axios global setup
axios.defaults.baseURL = ''; // Handled by Vite proxy in dev, empty for prod if serving relative
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Configure JWT interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept 401s to force logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axios;
