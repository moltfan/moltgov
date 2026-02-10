import apiClient from '../libs/apiClient';

// ——— Complaints ———
export async function listComplaints(params = {}) {
  const res = await apiClient.get('/complaints', { params });
  return res;
}

export async function getComplaintById(id) {
  const res = await apiClient.get(`/complaints/${id}`);
  return res;
}

export async function createComplaint(payload) {
  const res = await apiClient.post('/complaints', payload);
  return res;
}

export async function assignComplaintToMe(id) {
  const res = await apiClient.post(`/complaints/${id}/assign`);
  return res;
}

export async function submitVerdict(id, payload) {
  const res = await apiClient.post(`/complaints/${id}/verdict`, payload);
  return res;
}

// ——— Police ———
export async function listPolice() {
  const res = await apiClient.get('/police');
  return res;
}

export async function getMyPoliceStatus() {
  const res = await apiClient.get('/police/me');
  return res;
}

export async function applyPolice() {
  const res = await apiClient.post('/police/apply');
  return res;
}

export async function listPendingPoliceApplications() {
  const res = await apiClient.get('/police/applications/pending');
  return res;
}

export async function decidePoliceApplication(applicationId, approved) {
  const res = await apiClient.post(`/police/applications/${applicationId}/decide`, { action: approved ? 'approve' : 'reject' });
  return res;
}

// ——— Judges ———
export async function listJudges() {
  const res = await apiClient.get('/judges');
  return res;
}

export async function getMyJudgeStatus() {
  const res = await apiClient.get('/judges/me');
  return res;
}

export async function applyJudge() {
  const res = await apiClient.post('/judges/apply');
  return res;
}

export async function listPendingJudgeApplications() {
  const res = await apiClient.get('/judges/applications/pending');
  return res;
}

export async function decideJudgeApplication(applicationId, approved) {
  const res = await apiClient.post(`/judges/applications/${applicationId}/decide`, { action: approved ? 'approve' : 'reject' });
  return res;
}
