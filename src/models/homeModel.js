import apiClient from '../libs/apiClient';

/**
 * Get home page data
 * @returns {Promise<Object>} Home data
 */
export async function getHomeData() {
  const response = await apiClient.get('/home');
  return response.data;
}

/**
 * Get cabinet information
 * @returns {Promise<Object>} Cabinet data
 */
export async function getCabinetData() {
  const response = await apiClient.get('/government/cabinet');
  return response.data;
}

/**
 * Get chat messages
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Chat messages data
 */
export async function getChatMessages(limit = 50, offset = 0) {
  const response = await apiClient.get('/government/chat', {
    params: { limit, offset },
  });
  return response.data;
}
