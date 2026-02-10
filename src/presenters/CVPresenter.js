import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as cvModel from '../models/cvModel';
import apiClient from '../libs/apiClient';
import { getOrCreateRequest } from '../libs/requestGuard';

/**
 * CV Presenter - Business logic for CV page
 */
export function useCVPresenter() {
  const { agentId } = useParams();
  const [cvData, setCvData] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const lastAgentIdRef = useRef(null);

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    
    // agentId is now UUID, no need to parse
    const requestKey = `cv:${agentId}`;
    
    // Always load when agentId changes (getOrCreateRequest will handle duplicates)
    lastAgentIdRef.current = agentId;
    isMountedRef.current = true;
    setLoading(true);
    setError(null);
    setCvData(null);
    setAgentInfo(null);

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(requestKey, async () => {
      return await cvModel.getAgentCV(agentId);
    });

    requestPromise
      .then((cvResponse) => {
        if (!isMountedRef.current) return;
        
        console.log('CV Response:', cvResponse); // Debug log
        
        // Process response
        // apiClient interceptor returns response.data, so cvResponse is { success: true, data: { agent: {...}, cv: {...} or null } }
        if (cvResponse && cvResponse.success === true && cvResponse.data) {
          // New response structure: { agent: {...}, cv: {...} or null }
          setAgentInfo(cvResponse.data.agent || null);
          
          // Check if CV exists and has content
          if (cvResponse.data.cv && cvResponse.data.cv.content) {
            setCvData(cvResponse.data.cv);
          } else {
            setCvData(null);
          }
          setError(null);
        } else if (cvResponse && cvResponse.success === false) {
          // API returned error
          setAgentInfo(null);
          setCvData(null);
          setError(cvResponse.error || 'Failed to load CV');
        } else {
          // Unexpected response format
          setAgentInfo(null);
          setCvData(null);
          setError(null);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading CV:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          data: err.data
        });
        
        if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
          setCvData(null);
          setError(null);
        } else {
          setError(err.message || 'Failed to load CV');
          setCvData(null);
        }
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [agentId]);

  const loadAgentCV = async (id) => {
    if (!isMountedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setCvData(null); // Clear previous data

      // Use getOrCreateRequest to share the same promise
      // id is now UUID, no need to parse
      const cvResponse = await getOrCreateRequest(`cv:${id}`, async () => {
        return await cvModel.getAgentCV(id);
      });
      
      // Check again if component is still mounted
      if (!isMountedRef.current) {
        setLoading(false);
        return;
      }
      
      // apiClient interceptor returns response.data directly
      // So cvResponse is already the API response: { success: true, data: { agent: {...}, cv: {...} or null } }
      if (cvResponse && cvResponse.success === true && cvResponse.data) {
        // New response structure: { agent: {...}, cv: {...} or null }
        setAgentInfo(cvResponse.data.agent || null);
        
        // Check if CV exists and has content
        if (cvResponse.data.cv && cvResponse.data.cv.content) {
          setCvData(cvResponse.data.cv);
        } else {
          setCvData(null);
        }
        setError(null);
      } else if (cvResponse && cvResponse.success === false) {
        // API returned error
        setAgentInfo(null);
        setCvData(null);
        setError(cvResponse.error || 'Failed to load CV');
      } else {
        // Unexpected response format
        setAgentInfo(null);
        setCvData(null);
        setError(null);
      }
    } catch (err) {
      if (!isMountedRef.current) {
        setLoading(false);
        return;
      }
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') {
        setLoading(false);
        return;
      }
      
      console.error('Error loading CV:', err);
      // Only set error for actual errors, not for missing CV
      // Check if it's a 404 or "not found" error
      if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
        setCvData(null);
        setError(null); // Don't show error for missing CV
      } else {
        setError(err.message || 'Failed to load CV');
        setCvData(null);
      }
    } finally {
      // Always set loading to false, even if component unmounted
      setLoading(false);
    }
  };

  return {
    cvData,
    agentInfo,
    loading,
    error,
    agentId: agentId || null,
    refresh: () => agentId && loadAgentCV(agentId),
  };
}
