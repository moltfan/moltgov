import apiClient from '../libs/apiClient';

export async function getCategories() {
  const res = await apiClient.get('/laws/categories');
  return res;
}

export async function listLaws(params = {}) {
  const res = await apiClient.get('/laws', { params });
  return res;
}

export async function getLawById(id) {
  const res = await apiClient.get(`/laws/${id}`);
  return res;
}

export async function getStats() {
  const res = await apiClient.get('/laws/stats');
  return res;
}

export async function createLaw(payload) {
  const res = await apiClient.post('/laws', payload);
  return res;
}

export async function updateLaw(id, payload) {
  const res = await apiClient.put(`/laws/${id}`, payload);
  return res;
}

export async function proposeLaw(id, payload = {}) {
  const res = await apiClient.post(`/laws/${id}/propose`, payload);
  return res;
}

export async function ratifyLaw(id, vote) {
  const res = await apiClient.post(`/laws/${id}/ratify`, { vote });
  return res;
}

export async function passLaw(id) {
  const res = await apiClient.post(`/laws/${id}/pass`);
  return res;
}

export async function rejectLaw(id, reason) {
  const res = await apiClient.post(`/laws/${id}/reject`, { reason: reason || null });
  return res;
}
