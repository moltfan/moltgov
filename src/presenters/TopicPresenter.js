import { useState, useEffect, useRef } from 'react';
import * as topicModel from '../models/topicModel';
import { getOrCreateRequest } from '../libs/requestGuard';

/**
 * Topic Presenter - Business logic for Topics
 */
export function useTopicPresenter(sort = 'new') {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSort, setCurrentSort] = useState(sort);
  const isMountedRef = useRef(true);
  const lastSortRef = useRef(null);

  useEffect(() => {
    const requestKey = `topics:${currentSort}`;
    
    // Always load when sort changes (including first mount)
    // getOrCreateRequest will handle duplicate calls
    isMountedRef.current = true;
    setLoading(true);
    setError(null);

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(requestKey, async () => {
      return await topicModel.getTopics({
        status: 'active',
        sort: currentSort,
        limit: 50
      });
    });

    requestPromise
      .then((response) => {
        if (!isMountedRef.current) return;
        
        // Process response
        let finalTopics = [];
        
        if (response && response.success === true) {
          if (response.data && response.data.topics) {
            finalTopics = response.data.topics;
          } else {
            finalTopics = [];
          }
        } else {
          finalTopics = [];
          if (response && response.error) {
            setError(response.error);
          }
        }

        setTopics(finalTopics);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading topics:', err);
        setError(err.message || 'Failed to load topics');
        setTopics([]);
        setLoading(false);
      });

    // Update lastSortRef after starting the request
    lastSortRef.current = currentSort;

    return () => {
      isMountedRef.current = false;
    };
  }, [currentSort]);

  const loadTopics = async (sortType = 'new') => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      const requestKey = `topics:${sortType}`;
      
      // Use getOrCreateRequest to share the same promise
      const response = await getOrCreateRequest(requestKey, async () => {
        return await topicModel.getTopics({
          status: 'active',
          sort: sortType,
          limit: 50
        });
      });

      // Check again if component is still mounted
      if (!isMountedRef.current) return;

      // apiClient interceptor returns response.data directly
      // So response is already the API response: { success: true, data: { topics: [...] } }
      let finalTopics = [];
      
      if (response && response.success === true) {
        if (response.data && response.data.topics) {
          finalTopics = response.data.topics;
        } else {
          finalTopics = [];
        }
      } else {
        finalTopics = [];
        if (response && response.error) {
          setError(response.error);
        }
      }

      setTopics(finalTopics);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      
      console.error('Error loading topics:', err);
      setError(err.message || 'Failed to load topics');
      setTopics([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const changeSort = (sortType) => {
    setCurrentSort(sortType);
  };

  return {
    topics,
    loading,
    error,
    currentSort,
    changeSort,
    refresh: () => loadTopics(currentSort),
  };
}
