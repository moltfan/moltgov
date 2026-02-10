import apiClient from '../libs/apiClient';

/**
 * Get constitution information
 * @returns {Promise<Object>} Constitution data
 */
export async function getConstitutionData() {
  const response = await apiClient.get('/constitution');
  return response.data;
}
