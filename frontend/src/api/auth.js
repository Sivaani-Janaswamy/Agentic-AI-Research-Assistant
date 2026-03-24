import apiClient from './apiClient';

const setSession = ({ access_token, refresh_token, user }) => {
  if (access_token) {
    console.debug('[auth] storing access token');
    localStorage.setItem('token', access_token);
  }
  if (refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }
  if (user) {
    console.debug('[auth] storing user payload', user);
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
  console.debug('[auth] login response', response.data);
  setSession(response.data);
  return response.data;
};

export const signup = async (userData) => {
  const response = await apiClient.post('auth/signup', userData);
  console.debug('[auth] signup response', response.data);
  setSession(response.data);
  return response.data;
};

export const googleAuth = async (token) => {
  const response = await apiClient.post('auth/google', { token });
  console.debug('[auth] google response', response.data);
  setSession(response.data);
  return response.data;
};

export const forgotPassword = async (email) => {
  console.debug('[auth] forgot password start', { email });
  const response = await apiClient.post('auth/forgot-password', { email });
  console.debug('[auth] forgot password response', response.data);
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  console.debug('[auth] reset password start', { token_present: !!token });
  const response = await apiClient.post('auth/reset-password', {
    token,
    new_password: newPassword,
  });
  console.debug('[auth] reset password response', response.data);
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get('auth/me');
  console.debug('[auth] me response', response.data);
  const user = response.data;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  return user;
};

export const logout = () => {
  console.debug('[auth] clearing session');
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
