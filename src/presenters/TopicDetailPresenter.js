import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as topicModel from '../models/topicModel';
import { getOrCreateRequest } from '../libs/requestGuard';

/**
 * Topic Detail Presenter - Business logic for Topic Detail page
 */
export function useTopicDetailPresenter() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const lastTopicIdRef = useRef(null);

  useEffect(() => {
    if (!topicId) {
      setLoading(false);
      return;
    }
    
    // topicId is now UUID, no need to parse
    const requestKey = `topic:${topicId}`;
    
    // Always load when topicId changes (getOrCreateRequest will handle duplicates)
    lastTopicIdRef.current = topicId;
    isMountedRef.current = true;
    setLoading(true);
    setError(null);
    setTopic(null);
    setMessages([]);

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(requestKey, async () => {
      const [topicData, messagesData] = await Promise.all([
        topicModel.getTopicById(topicId),
        topicModel.getTopicMessages(topicId, { limit: 100 })
      ]);
      return { topicData, messagesData };
    });

    requestPromise
      .then(({ topicData, messagesData }) => {
        if (!isMountedRef.current) return;
        
        // Process topic data
        // apiClient interceptor returns response.data, so topicData is { success: true, data: {...} }
        let finalTopic = null;
        
        if (topicData) {
          if (topicData.success === true) {
            if (topicData.data && topicData.data !== null && topicData.data !== undefined) {
              finalTopic = topicData.data;
            } else {
              finalTopic = null;
              setError('Topic not found');
            }
          } else if (topicData.success === false) {
            finalTopic = null;
            setError(topicData.error || 'Topic not found');
          } else {
            // Response doesn't have success field - might be direct data
            if (topicData.id || topicData.title) {
              finalTopic = topicData;
            } else {
              finalTopic = null;
              setError('Topic not found');
            }
          }
        } else {
          finalTopic = null;
          setError('Topic not found');
        }

        // Process messages data
        // apiClient interceptor returns response.data, so messagesData is { success: true, data: { topic, messages, ... } }
        let finalMessages = [];
        
        if (messagesData) {
          if (messagesData.success === true) {
            if (messagesData.data && messagesData.data.messages) {
              finalMessages = messagesData.data.messages;
            } else if (messagesData.data && Array.isArray(messagesData.data)) {
              // Fallback: if data is directly an array
              finalMessages = messagesData.data;
            } else {
              finalMessages = [];
            }
          } else {
            finalMessages = [];
          }
        } else {
          finalMessages = [];
        }

        setTopic(finalTopic);
        setMessages(finalMessages);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading topic detail:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        if (err.response?.status === 404 || err.message?.toLowerCase().includes('not found')) {
          setTopic(null);
          setError('Topic not found');
        } else {
          setError(err.message || 'Failed to load topic');
          setTopic(null);
        }
        setMessages([]);
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [topicId]);

  const loadTopicDetail = async (id) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // id is now UUID, no need to parse
      const requestKey = `topic:${id}`;
      
      // Use getOrCreateRequest to share the same promise
      const { topicData, messagesData } = await getOrCreateRequest(requestKey, async () => {
        const [topicData, messagesData] = await Promise.all([
          topicModel.getTopicById(id),
          topicModel.getTopicMessages(id, { limit: 100 })
        ]);
        return { topicData, messagesData };
      });

      // Check again if component is still mounted
      if (!isMountedRef.current) return;

      // apiClient interceptor returns response.data directly
      // So topicData is already the API response: { success: true, data: {...} }
      let finalTopic = null;
      
      if (topicData) {
        if (topicData.success === true) {
          if (topicData.data && topicData.data !== null && topicData.data !== undefined) {
            finalTopic = topicData.data;
          } else {
            finalTopic = null;
          }
        } else if (topicData.success === false) {
          finalTopic = null;
          setError(topicData.error || 'Topic not found');
        } else {
          // Response doesn't have success field - might be direct data
          if (topicData.id || topicData.title) {
            // This looks like topic data directly
            finalTopic = topicData;
          } else {
            finalTopic = null;
          }
        }
      } else {
        finalTopic = null;
      }

      // Messages response structure: { success: true, data: { topic: {...}, messages: [...] } }
      let finalMessages = [];
      
      if (messagesData) {
        if (messagesData.success === true) {
          if (messagesData.data && messagesData.data.messages) {
            finalMessages = messagesData.data.messages;
          } else {
            finalMessages = [];
          }
        } else {
          finalMessages = [];
        }
      } else {
        finalMessages = [];
      }

      setTopic(finalTopic);
      setMessages(finalMessages);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      
      console.error('Error loading topic detail:', err);
      // Check if it's a 404 or "not found" error
      if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
        setTopic(null);
        setError(null); // Don't show error, just show "not found" message
      } else {
        setError(err.message || 'Failed to load topic');
        setTopic(null);
      }
      setMessages([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return {
    topic,
    messages,
    loading,
    error,
    refresh: () => topicId && loadTopicDetail(topicId),
  };
}
