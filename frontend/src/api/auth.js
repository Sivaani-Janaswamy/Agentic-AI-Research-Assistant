import apiClient from './apiClient';

const setSession = ({ access_token, user }) => {
  if (access_token) {
    localStorage.setItem('token', access_token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  
  const response = await apiClient.post('auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  setSession(response.data);
  return response.data;
};

export const signup = async (userData) => {
  const response = await apiClient.post('auth/signup', userData);
  setSession(response.data);
  return response.data;
};

export const googleAuth = async (token) => {
  const response = await apiClient.post('auth/google', { token });
  setSession(response.data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get('auth/me');
  const user = response.data;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  return user;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};
