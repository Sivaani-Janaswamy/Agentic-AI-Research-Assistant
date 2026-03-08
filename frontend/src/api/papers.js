import apiClient from './apiClient';

export const fetchRecentPapers = async (limit = 10) => {
  const response = await apiClient.get('/papers/recent', { params: { limit } });
  return response.data;
};

export const searchPapers = async (query, limit = 10) => {
  const response = await apiClient.get('/papers/search', { params: { q: query, limit } });
  return response.data;
};

export const getPaperDetails = async (paperId) => {
  const response = await apiClient.get(`/papers/${paperId}`);
  return response.data;
};

export const getRelatedPapers = async (query = '', paperId = '') => {
  const params = {};
  if (query) params.q = query;
  if (paperId) params.paper_id = paperId;
  const response = await apiClient.get('/papers/related', { params });
  return response.data;
};

export const getFavorites = async () => {
  const response = await apiClient.get('/user/favorites');
  return response.data;
};

export const addFavorite = async (paperData) => {
  const response = await apiClient.post('/user/favorites', paperData);
  return response.data;
};

export const removeFavorite = async (paperId) => {
  const response = await apiClient.delete(`/user/favorites/${paperId}`);
  return response.data;
};

export const getHistory = async () => {
  const response = await apiClient.get('/user/history');
  return response.data;
};
