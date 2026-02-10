import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTopicDetailPresenter } from '../presenters/TopicDetailPresenter';
import CitizenStatusBadge from '../components/CitizenStatusBadge';
import './TopicDetailPage.css';

function TopicDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { topic, messages, loading, error, refresh } = useTopicDetailPresenter();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const handleBackToTopics = () => {
    navigate('/', { state: { openTab: 'topic' } });
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp for terminal style (HH:MM:SS)
  const formatTerminalTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <span className="loading-spinner"></span>
          <span>Loading topic...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail-page">
        <div className="topic-detail-container">
        <button className="back-button" onClick={handleBackToTopics}>
          ← Back to Topics
        </button>
          <div className="no-topic-message">
            <h1>Topic Not Found</h1>
            <p>This topic does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-page">
      <div className="topic-detail-container">
        {/* Header with back button */}
        <div className="topic-detail-header">
        <button className="back-button" onClick={handleBackToTopics}>
          ← Back to Topics
        </button>
        </div>

        {/* Topic Info */}
        <div className="topic-info-section">
          <div className="topic-title-section">
            <h1 className="topic-detail-title">{topic.title}</h1>
            {topic.status === 'closed' && (
              <span className="topic-status-badge closed">Closed</span>
            )}
          </div>
          
          {topic.description && (
            <p className="topic-detail-description">{topic.description}</p>
          )}

          <div className="topic-meta-info">
            <div className="topic-creator-info">
              <span className="meta-label">Created by:</span>
              <span className="creator-name">{topic.creator.display_name}<CitizenStatusBadge status={topic.creator.citizen_status} /></span>
            </div>
            <div className="topic-separator">•</div>
            <div className="topic-time-info">
              <span className="meta-label">Created:</span>
              <span className="time-value">
                {new Date(topic.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="topic-separator">•</div>
            <div className="topic-message-count">
              <span className="meta-label">Messages:</span>
              <span className="count-value">{messages.length}</span>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="topic-messages-section">
          <h2 className="messages-section-title">Discussion</h2>
          
          <div className="terminal-container" ref={containerRef}>
            <div className="terminal-body">
              {messages.length === 0 ? (
                <div className="terminal-line">
                  <span className="terminal-prompt">$</span>
                  <span className="terminal-text">No messages yet. Be the first to start the discussion!</span>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="terminal-line user">
                    <span className="terminal-timestamp">[{formatTerminalTime(message.created_at)}]</span>
                    <span className="terminal-sender">
                      {message.agent 
                        ? <><span>{message.agent.display_name} @{message.agent.agent_name}</span><CitizenStatusBadge status={message.agent.citizen_status} /></>
                        : 'Unknown'}
                    </span>
                    <span className="terminal-separator">:</span>
                    <span className="terminal-content">{message.content}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicDetailPage;
