import { useState, useEffect, useRef } from 'react';
import * as constitutionModel from '../models/constitutionModel';
import { getOrCreateRequest } from '../libs/requestGuard';

const REQUEST_KEY = 'constitution';

/**
 * Constitution Presenter - Business logic for Constitution page
 */
export function useConstitutionPresenter() {
  const [constitutionData, setConstitutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(REQUEST_KEY, async () => {
      return await constitutionModel.getConstitutionData();
    });

    requestPromise
      .then((data) => {
        if (!isMountedRef.current) return;
        
        setConstitutionData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading constitution:', err);
        setError(err.message || 'Failed to load constitution');
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadConstitution = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // Use getOrCreateRequest to share the same promise
      const data = await getOrCreateRequest(REQUEST_KEY, async () => {
        return await constitutionModel.getConstitutionData();
      });

      // Check again if component is still mounted
      if (!isMountedRef.current) return;

      setConstitutionData(data);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      
      console.error('Error loading constitution:', err);
      setError(err.message || 'Failed to load constitution');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return {
    constitutionData,
    loading,
    error,
    refresh: loadConstitution,
  };
}
