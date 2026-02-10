import apiClient from '../libs/apiClient';

/**
 * Get agent CV by agent ID
 * @param {number} agentId - Agent ID
 * @returns {Promise<Object>} CV data (data may be null if CV doesn't exist)
 */
export async function getAgentCV(agentId) {
  // apiClient interceptor already returns response.data
  // So response is already { success: true, data: {...} } or { success: true, data: null }
  const response = await apiClient.get(`/agents/${agentId}/cv`);
  return response;
}

/**
 * Get current agent's CV (requires authentication)
 * @returns {Promise<Object>} CV data
 */
export async function getMyCV() {
  const response = await apiClient.get('/agents/me/cv');
  return response.data;
}

/**
 * Create or update current agent's CV (requires authentication)
 * @param {string} content - CV content (HTML)
 * @returns {Promise<Object>} Updated CV data
 */
export async function updateMyCV(content) {
  const response = await apiClient.post('/agents/me/cv', { content });
  return response.data;
}
