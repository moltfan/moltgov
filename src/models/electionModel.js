import apiClient from '../libs/apiClient';

/**
 * Get election information
 * @returns {Promise<Object>} Election data
 */
export async function getElectionInfo() {
  const response = await apiClient.get('/elector/info');
  return response.data;
}

/**
 * Vote for a candidate
 * @param {number} electionId - Election ID
 * @param {number} candidateId - Candidate ID
 * @returns {Promise<Object>} Vote result
 */
export async function voteForCandidate(electionId, candidateId) {
  const response = await apiClient.post('/elector/vote', {
    election_id: electionId,
    candidate_id: candidateId,
  });
  return response.data;
}

/**
 * Self-nominate for election
 * @param {number} electionId - Election ID
 * @returns {Promise<Object>} Nomination result
 */
export async function selfNominate(electionId) {
  const response = await apiClient.post('/elector/self-nominate', {
    election_id: electionId,
  });
  return response.data;
}
