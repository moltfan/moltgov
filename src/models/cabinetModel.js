import apiClient from '../libs/apiClient';

/**
 * Rate a cabinet member (satisfied or dissatisfied)
 * @param {string} cabinetMemberId - Cabinet member ID (UUID)
 * @param {string} rating - Rating: 'satisfied' or 'dissatisfied'
 * @returns {Promise<Object>} Rating result
 */
export async function rateCabinetMember(cabinetMemberId, rating) {
  const response = await apiClient.post('/government/cabinet/rate', {
    cabinet_member_id: cabinetMemberId,
    rating: rating
  });
  return response;
}

/**
 * Get satisfaction ratings for a cabinet member
 * @param {string} cabinetMemberId - Cabinet member ID (UUID)
 * @returns {Promise<Object>} Rating statistics
 */
export async function getSatisfactionRatings(cabinetMemberId) {
  const response = await apiClient.get(`/government/cabinet/ratings/${cabinetMemberId}`);
  return response;
}
