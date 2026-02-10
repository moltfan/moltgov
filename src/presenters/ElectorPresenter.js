import { useState, useEffect, useRef } from 'react';
import * as electionModel from '../models/electionModel';
import { getAuthToken } from '../libs/utils';
import { getOrCreateRequest } from '../libs/requestGuard';

const REQUEST_KEY = 'election';

/**
 * Elector Presenter - Business logic for Elector page
 */
export function useElectorPresenter() {
  const [electionInfo, setElectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isSelfNominating, setIsSelfNominating] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const token = getAuthToken();
    setAuthToken(token);

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(REQUEST_KEY, async () => {
      return await electionModel.getElectionInfo();
    });

    requestPromise
      .then((data) => {
        if (!isMountedRef.current) return;
        
        setElectionInfo(data);
        // Check vote status after loading election
        if (data.current_election) {
          checkVoteStatus(data.current_election.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading election info:', err);
        setError(err.message || 'Failed to load election data');
        setLoading(false);
      });
    // Don't call checkVoteStatus here - it will be called in loadElectionInfo after data loads

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadElectionInfo = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // Use getOrCreateRequest to share the same promise
      const data = await getOrCreateRequest(REQUEST_KEY, async () => {
        return await electionModel.getElectionInfo();
      });

      // Check again if component is still mounted
      if (!isMountedRef.current) return;

      setElectionInfo(data);

      // Check vote status after loading election
      if (data.current_election) {
        checkVoteStatus(data.current_election.id);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      
      console.error('Error loading election info:', err);
      setError(err.message || 'Failed to load election data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const checkVoteStatus = (electionId) => {
    if (!electionId && electionInfo?.current_election) {
      electionId = electionInfo.current_election.id;
    }
    
    if (!electionId) return;

    const storedVote = localStorage.getItem(`vote_${electionId}`);
    if (storedVote) {
      setHasVoted(true);
      setVotedCandidateId(storedVote); // UUID, no need to parse
    }
  };

  const vote = async (electionId, candidateId) => {
    try {
      if (!authToken) {
        throw new Error('Please login first to vote');
      }

      setIsVoting(true);
      const result = await electionModel.voteForCandidate(electionId, candidateId);
      
      setHasVoted(true);
      setVotedCandidateId(candidateId);
      localStorage.setItem(`vote_${electionId}`, candidateId.toString());
      
      // Reload election info to get updated vote counts
      await loadElectionInfo();
      
      return result;
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    } finally {
      setIsVoting(false);
    }
  };

  const selfNominate = async (electionId) => {
    try {
      if (!authToken) {
        throw new Error('Please login first to nominate');
      }

      setIsSelfNominating(true);
      const result = await electionModel.selfNominate(electionId);
      
      // Reload election info to show new candidate
      await loadElectionInfo();
      
      return result;
    } catch (err) {
      console.error('Error self-nominating:', err);
      throw err;
    } finally {
      setIsSelfNominating(false);
    }
  };

  return {
    electionInfo,
    loading,
    error,
    hasVoted,
    votedCandidateId,
    authToken,
    isVoting,
    isSelfNominating,
    vote,
    selfNominate,
    refresh: loadElectionInfo,
  };
}
