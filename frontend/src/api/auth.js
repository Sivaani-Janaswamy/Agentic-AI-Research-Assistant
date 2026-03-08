import apiClient from './apiClient';

export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const signup = async (userData) => {
  const response = await apiClient.post('/auth/signup', userData);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const googleAuth = async (token) => {
  const response = await apiClient.post('/auth/google', { token });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
