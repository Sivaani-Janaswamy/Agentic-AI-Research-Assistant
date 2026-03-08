import apiClient from './apiClient';

export const summarizePdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/analysis/summarize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const summarizePaper = async (paperId) => {
  const formData = new FormData();
  formData.append('paper_id', paperId);
  const response = await apiClient.post('/analysis/summarize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const detectGaps = async (topic) => {
  const response = await apiClient.post('/analysis/detect-gaps', { topic });
  return response.data;
};

export const comparePapers = async (paperIds) => {
  const response = await apiClient.post('/analysis/compare', { paper_ids: paperIds });
  return response.data;
};

export const askQuestion = async (question) => {
  const response = await apiClient.post('/ask', { question });
  return response.data;
};
