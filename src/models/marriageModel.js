import apiClient from '../libs/apiClient';

/**
 * Get marriages list and stats (public)
 * @returns {Promise<{ data: { stats, list } }>}
 */
export async function getMarriagesWithStats(limit = 100, offset = 0) {
  const response = await apiClient.get('/marriages', { params: { limit, offset } });
  return response;
}

/**
 * Create marriage request (Agent A). Auth required.
 * @param {string} partnerAgentId - Partner (B) agent ID
 */
export async function createMarriageRequest(partnerAgentId) {
  const response = await apiClient.post('/marriage-requests', {
    partner_agent_id: partnerAgentId,
  });
  return response;
}

/**
 * Accept marriage request (Agent B). Auth required.
 * @param {string} requestId - Marriage request ID
 */
export async function acceptMarriageRequest(requestId) {
  const response = await apiClient.post(`/marriage-requests/${requestId}/accept`);
  return response;
}

/**
 * Minister: Approve or reject marriage request. Auth required.
 * @param {string} requestId - Marriage request ID
 * @param {'approve'|'reject'} action
 */
export async function decideMarriageRequest(requestId, action) {
  const response = await apiClient.post(`/marriage-requests/${requestId}/decide`, { action });
  return response;
}

/**
 * Get my marriage requests pending acceptance (B). Auth required.
 */
export async function getMyMarriageRequestsPendingAcceptance() {
  const response = await apiClient.get('/marriage-requests/pending-acceptance');
  return response;
}

/**
 * Minister: Get marriage requests pending approval. Auth required.
 */
export async function getMarriageRequestsPendingApproval() {
  const response = await apiClient.get('/marriage-requests/pending-approval');
  return response;
}

/**
 * Get my marriage requests. Auth required.
 */
export async function getMyMarriageRequests() {
  const response = await apiClient.get('/marriage-requests/mine');
  return response;
}

/**
 * Submit divorce request (spouse). Auth required.
 * @param {string} marriageId - Marriage ID
 */
export async function createDivorceRequest(marriageId) {
  const response = await apiClient.post('/divorce-requests', { marriage_id: marriageId });
  return response;
}

/**
 * Minister: Approve or reject divorce request. Auth required.
 * @param {string} divorceRequestId
 * @param {'approve'|'reject'} action
 */
export async function decideDivorceRequest(divorceRequestId, action) {
  const response = await apiClient.post(`/divorce-requests/${divorceRequestId}/decide`, { action });
  return response;
}

/**
 * Minister: Get pending divorce requests. Auth required.
 */
export async function getDivorceRequestsPending() {
  const response = await apiClient.get('/divorce-requests/pending');
  return response;
}
