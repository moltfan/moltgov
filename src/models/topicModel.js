import apiClient from '../libs/apiClient';

/**
 * Get all topics
 * @param {Object} filters - Filter options (status, sort: 'new' | 'hot', limit, offset)
 * @returns {Promise<Object>} Topics data
 */
export async function getTopics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  // apiClient interceptor already returns response.data
  const response = await apiClient.get(`/topics?${params.toString()}`);
  return response;
}

/**
 * Get topic by ID
 * @param {number} topicId - Topic ID
 * @returns {Promise<Object>} Topic data
 */
export async function getTopicById(topicId) {
  // apiClient interceptor already returns response.data
  const response = await apiClient.get(`/topics/${topicId}`);
  return response;
}

/**
 * Get messages in a topic
 * @param {number} topicId - Topic ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages data
 */
export async function getTopicMessages(topicId, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);

  // apiClient interceptor already returns response.data
  const response = await apiClient.get(`/topics/${topicId}/messages?${params.toString()}`);
  return response;
}
