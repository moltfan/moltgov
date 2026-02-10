import { useState, useEffect, useRef } from 'react';
import * as homeModel from '../models/homeModel';
import { getOrCreateRequest } from '../libs/requestGuard';

const REQUEST_KEY = 'home';

/**
 * Home Presenter - Business logic for Home page
 */
export function useHomePresenter() {
  const [homeData, setHomeData] = useState(null);
  const [cabinetData, setCabinetData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatTotal, setChatTotal] = useState(0);
  const [loadingOlderChat, setLoadingOlderChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Use getOrCreateRequest to share the same promise between component instances
    const requestPromise = getOrCreateRequest(REQUEST_KEY, async () => {
      return await homeModel.getHomeData();
    });

    requestPromise
      .then((home) => {
        if (!isMountedRef.current) return;
        
        setHomeData(home);
        setCabinetData(home.cabinet_info || null);
        setChatMessages(home.recent_chat_messages || []);
        setChatTotal(home.chat_total || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        // Ignore abort errors
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        
        console.error('Error loading home data:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
    
    // Refresh chat messages every 5 seconds
    const chatInterval = setInterval(() => {
      if (isMountedRef.current) {
        loadChatMessages();
      }
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(chatInterval);
    };
  }, []);

  const loadData = async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // Use getOrCreateRequest to share the same promise
      const home = await getOrCreateRequest(REQUEST_KEY, async () => {
        return await homeModel.getHomeData();
      });

      // Check again if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      setHomeData(home);
      // Use cabinet_info from home API instead of separate call
      setCabinetData(home.cabinet_info || null);
      // Use chat messages from home API instead of separate call
      setChatMessages(home.recent_chat_messages || []);
      setChatTotal(home.chat_total || 0);
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      
      if (!isMountedRef.current) return;
      console.error('Error loading home data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const loadChatMessages = async () => {
    try {
      const chat = await homeModel.getChatMessages(50, 0);
      const newBatch = chat.messages || [];
      setChatTotal(chat.total || 0);
      setChatMessages((prev) => {
        if (prev.length === 0) return newBatch;
        const maxId = Math.max(...prev.map((m) => Number(m.id)));
        const toAppend = newBatch.filter((m) => Number(m.id) > maxId);
        if (toAppend.length === 0) return prev;
        return [...prev, ...toAppend];
      });
    } catch (err) {
      console.error('Error loading chat messages:', err);
    }
  };

  /**
   * Load older chat messages when user scrolls to top.
   * Returns a promise that resolves with { prependedCount } for scroll restoration.
   */
  const loadOlderChatMessages = async () => {
    if (loadingOlderChat || !isMountedRef.current) return { prependedCount: 0 };
    const currentLength = chatMessages.length;
    if (currentLength >= chatTotal) return { prependedCount: 0 };

    setLoadingOlderChat(true);
    try {
      const chat = await homeModel.getChatMessages(50, currentLength);
      const older = chat.messages || [];
      if (older.length === 0 || !isMountedRef.current) {
        return { prependedCount: 0 };
      }
      setChatMessages((prev) => {
        const olderIds = new Set(older.map((m) => m.id));
        const keptPrev = prev.filter((m) => !olderIds.has(m.id));
        return [...older, ...keptPrev];
      });
      return { prependedCount: older.length };
    } catch (err) {
      console.error('Error loading older chat messages:', err);
      return { prependedCount: 0 };
    } finally {
      if (isMountedRef.current) {
        setLoadingOlderChat(false);
      }
    }
  };

  return {
    homeData,
    cabinetData,
    chatMessages,
    chatTotal,
    loading,
    loadingOlderChat,
    error,
    refresh: loadData,
    loadOlderChatMessages,
  };
}
