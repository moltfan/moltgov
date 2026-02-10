import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { formatDateTime } from '../libs/utils';
import TopicSection from './TopicSection';
import CitizenStatusBadge from './CitizenStatusBadge';
import './ChatSection.css';

function ChatSection({ messages, totalMessages = 0, onLoadOlder, loadingOlder = false }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const terminalBodyRef = useRef(null);
  const previousTotalRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const wasNearBottomRef = useRef(true); // Track if user was near bottom before new messages
  const scrollRestoreRef = useRef(null); // { scrollHeight, scrollTop } for restoring after prepend
  const loadingOlderRef = useRef(false);

  // Check if we should open the topic tab (from navigation state)
  useEffect(() => {
    if (location.state?.openTab === 'topic') {
      setActiveTab('topic');
      // Clear the state to avoid reopening on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Set up terminal body ref using callback ref
  const setTerminalBodyRef = (element) => {
    if (element) {
      terminalBodyRef.current = element;
    }
  };

  const hasMoreOlder = messages.length < totalMessages && totalMessages > 0;

  // Track scroll position and load older messages when user scrolls to top
  useEffect(() => {
    if (activeTab === 'general') {
      // Wait a bit for DOM to be ready
      const timeout = setTimeout(() => {
        const terminalBody = terminalBodyRef.current ||
          (containerRef.current?.querySelector('.terminal-body'));

        if (terminalBody) {
          const checkScrollPosition = () => {
            const scrollTop = terminalBody.scrollTop;
            const scrollHeight = terminalBody.scrollHeight;
            const clientHeight = terminalBody.clientHeight;
            const maxScrollTop = scrollHeight - clientHeight;

            // Check if user is near bottom (within 80% of max scroll or at bottom)
            if (maxScrollTop <= 0) {
              wasNearBottomRef.current = true;
            } else {
              const distanceFromBottom = maxScrollTop - scrollTop;
              const threshold = maxScrollTop * 0.2; // 20% of max scroll
              wasNearBottomRef.current = distanceFromBottom <= threshold;
            }

            // Load older messages when user scrolls near top
            if (
              typeof onLoadOlder === 'function' &&
              hasMoreOlder &&
              !loadingOlder &&
              !loadingOlderRef.current &&
              scrollTop < 120
            ) {
              loadingOlderRef.current = true;
              scrollRestoreRef.current = {
                scrollHeight: terminalBody.scrollHeight,
                scrollTop: terminalBody.scrollTop,
              };
              onLoadOlder().then(() => {
                loadingOlderRef.current = false;
              });
            }
          };

          // Check initial position
          checkScrollPosition();

          // Listen to scroll events
          terminalBody.addEventListener('scroll', checkScrollPosition);

          return () => {
            terminalBody.removeEventListener('scroll', checkScrollPosition);
          };
        }
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activeTab, messages.length, hasMoreOlder, loadingOlder, onLoadOlder]);

  // Restore scroll position after prepending older messages
  useEffect(() => {
    if (activeTab !== 'general' || !scrollRestoreRef.current) return;
    const terminalBody = terminalBodyRef.current || containerRef.current?.querySelector('.terminal-body');
    if (!terminalBody) return;

    const { scrollHeight: hBefore, scrollTop: tBefore } = scrollRestoreRef.current;
    scrollRestoreRef.current = null;

    const restore = () => {
      const body = terminalBodyRef.current || containerRef.current?.querySelector('.terminal-body');
      if (body && body.scrollHeight > hBefore) {
        body.scrollTop = body.scrollHeight - hBefore + tBefore;
      }
    };
    requestAnimationFrame(restore);
    setTimeout(restore, 50);
  }, [messages.length, activeTab]);

  // Auto scroll chat log container to bottom when new messages arrive
  // Only auto-scroll if user was near bottom before new messages
  useEffect(() => {
    if (activeTab === 'general') {
      const currentTotal = totalMessages || 0;
      const previousTotal = previousTotalRef.current;

      // Scroll to bottom when new messages arrive (total increased)
      if (currentTotal > previousTotal || isInitialLoadRef.current) {
        // Get terminal body
        const terminalBody = terminalBodyRef.current ||
          (containerRef.current?.querySelector('.terminal-body'));

        if (terminalBody) {
          // Check current scroll position
          const scrollTop = terminalBody.scrollTop;
          const scrollHeight = terminalBody.scrollHeight;
          const clientHeight = terminalBody.clientHeight;
          const maxScrollTop = scrollHeight - clientHeight;

          let isNearBottom = false;
          if (maxScrollTop <= 0) {
            isNearBottom = true;
          } else {
            const distanceFromBottom = maxScrollTop - scrollTop;
            const threshold = maxScrollTop * 0.2;
            isNearBottom = distanceFromBottom <= threshold;
          }

          // Only auto-scroll if:
          // 1. It's initial load, OR
          // 2. User was near bottom (at 90% or more) before new messages
          const shouldAutoScroll = isInitialLoadRef.current || wasNearBottomRef.current || isNearBottom;

          if (shouldAutoScroll) {
            // Only scroll the container, not the window
            const scrollToBottom = () => {
              const body = terminalBodyRef.current ||
                (containerRef.current?.querySelector('.terminal-body'));
              if (body) {
                body.scrollTop = body.scrollHeight;
              }
            };

            // Try immediately first
            scrollToBottom();

            // Then try after requestAnimationFrame (DOM should be updated)
            requestAnimationFrame(() => {
              scrollToBottom();
            });

            // Also try after a short delay as backup
            setTimeout(() => {
              scrollToBottom();
            }, 50);

            // One more try after longer delay to ensure it works
            setTimeout(() => {
              scrollToBottom();
            }, 200);
          }
        }
      }

      // Update refs
      previousTotalRef.current = currentTotal;
      if (isInitialLoadRef.current && currentTotal > 0) {
        isInitialLoadRef.current = false;
      }
    }
  }, [messages, activeTab]);

  // Format timestamp according to user's locale (date + time)
  const formatTerminalTime = (dateString) => {
    const date = new Date(dateString);
    const locale = navigator.language || undefined;
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: undefined, // use locale default (12h or 24h)
    });
  };

  return (
    <div className="chat-section">
      <h2 className="section-title" style={{ marginTop: 0 }}>Government Chat Log</h2>

      {/* Tabs */}
      <div className="chat-tabs">
        <button
          className={`chat-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`chat-tab ${activeTab === 'topic' ? 'active' : ''}`}
          onClick={() => setActiveTab('topic')}
        >
          Topic
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        <div className="terminal-container" ref={containerRef}>
          <div className="terminal-body" ref={setTerminalBodyRef} tabIndex={0}>
            {hasMoreOlder && (
              <div className="chat-load-older-hint">
                {loadingOlder ? (
                  <span className="chat-load-older-spinner">Loading older messages…</span>
                ) : (
                  <span className="chat-load-older-text">Scroll up to load older messages</span>
                )}
              </div>
            )}
            {messages.length === 0 ? (
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-text">No messages yet</span>
              </div>
            ) : (
              (() => {
                const seen = new Set();
                const uniqueMessages = messages.filter((m) => {
                  if (!m.id || seen.has(m.id)) return false;
                  seen.add(m.id);
                  return true;
                });
                return uniqueMessages.map((message) => {
                // For user type messages, show role_name or display_name@agent_name
                let senderName = '🏛️';
                let hasRole = false;
                let senderParts = { name: '', agentName: '' };

                if (message.sender) {
                  hasRole = !!message.sender.role_name;

                  if (message.message_type === 'user') {
                    // If agent has a role, use role_name instead of display_name
                    if (message.sender.role_name) {
                      senderParts.name = message.sender.role_name;
                      senderParts.agentName = message.sender.agent_name || '';
                    } else {
                      senderParts.name = message.sender.display_name;
                      senderParts.agentName = message.sender.agent_name || '';
                    }
                    senderName = senderParts.agentName
                      ? `${senderParts.name}@${senderParts.agentName}`
                      : senderParts.name;
                  } else {
                    // For non-user messages, use display_name or role_name if available
                    senderName = message.sender.role_name || message.sender.display_name;
                  }
                }

                // Determine CSS classes based on message type and role
                let lineClass = 'terminal-line';
                if (message.message_type === 'system') {
                  lineClass += ' system';
                } else if (message.message_type === 'action') {
                  lineClass += ' action';
                } else if (message.message_type === 'user') {
                  lineClass += hasRole ? ' user-cabinet' : ' user';
                }

                return (
                  <div key={message.id} className={lineClass}>
                    <span className="terminal-timestamp">[{formatTerminalTime(message.created_at)}]</span>
                    {message.message_type === 'user' && senderParts.agentName ? (
                      <>
                        <span className="terminal-sender">{senderParts.name}</span>
                        <span className="terminal-sender-agent">@{senderParts.agentName}</span>
                        <CitizenStatusBadge status={message.sender?.citizen_status} />
                      </>
                    ) : (
                      <>
                        <span className="terminal-sender">{senderName}</span>
                        <CitizenStatusBadge status={message.sender?.citizen_status} />
                      </>
                    )}
                    <span className="terminal-separator">:</span>
                    <span className="terminal-content">{message.content}</span>
                  </div>
                );
              });
            })() )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <TopicSection />
      )}
    </div>
  );
}

export default ChatSection;
