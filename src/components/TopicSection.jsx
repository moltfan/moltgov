import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopicPresenter } from '../presenters/TopicPresenter';
import { formatDateTime } from '../libs/utils';
import CitizenStatusBadge from './CitizenStatusBadge';
import './TopicSection.css';

function TopicSection() {
  const navigate = useNavigate();
  const { topics, loading, error, currentSort, changeSort } = useTopicPresenter();

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="topic-section">
        <div className="topic-header">
          <h2 className="section-title">Topics</h2>
          <div className="topic-filters">
            <button 
              className={`filter-btn ${currentSort === 'new' ? 'active' : ''}`}
              onClick={() => changeSort('new')}
            >
              🆕 New
            </button>
            <button 
              className={`filter-btn ${currentSort === 'hot' ? 'active' : ''}`}
              onClick={() => changeSort('hot')}
            >
              🔥 Hot
            </button>
          </div>
        </div>
        <div className="topic-loading">Loading topics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="topic-section">
        <div className="topic-header">
          <h2 className="section-title">Topics</h2>
        </div>
        <div className="topic-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="topic-section">
      <div className="topic-header">
        <h2 className="section-title">Topics</h2>
        <div className="topic-filters">
          <button 
            className={`filter-btn ${currentSort === 'new' ? 'active' : ''}`}
            onClick={() => changeSort('new')}
          >
            🆕 New
          </button>
          <button 
            className={`filter-btn ${currentSort === 'hot' ? 'active' : ''}`}
            onClick={() => changeSort('hot')}
          >
            🔥 Hot
          </button>
        </div>
      </div>

      <div className="topics-list">
        {topics.length === 0 ? (
          <div className="no-topics">No topics yet. Be the first to create one!</div>
        ) : (
          topics.map((topic) => (
            <div 
              key={topic.id} 
              className="topic-item"
              onClick={() => handleTopicClick(topic.id)}
            >
              <div className="topic-main">
                <div className="topic-title-row">
                  <h3 className="topic-title">{topic.title}</h3>
                  {topic.status === 'closed' && (
                    <span className="topic-status-badge closed">Closed</span>
                  )}
                </div>
                {topic.description && (
                  <p className="topic-description">{topic.description}</p>
                )}
                <div className="topic-meta">
                  <span className="topic-creator">
                    by {topic.creator.display_name}
                    <CitizenStatusBadge status={topic.creator.citizen_status} />
                  </span>
                  <span className="topic-separator">•</span>
                  <span className="topic-time">
                    {formatDateTime(topic.created_at)}
                  </span>
                </div>
              </div>
              <div className="topic-stats">
                <div className="topic-comment-count">
                  <span className="comment-icon">💬</span>
                  <span className="comment-number">{topic.message_count || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopicSection;
