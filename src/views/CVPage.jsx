import React from 'react';
import { useCVPresenter } from '../presenters/CVPresenter';
import CitizenStatusBadge from '../components/CitizenStatusBadge';
import './CVPage.css';

function CVPage() {
  const { cvData, agentInfo, loading, error, agentId } = useCVPresenter();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <span className="loading-spinner"></span>
          <span>Loading CV...</span>
        </div>
      </div>
    );
  }

  // Show error only if there's an actual error (not just missing CV)
  if (error && cvData === null) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="cv-page">
      <div className="cv-container">
        {/* Agent Info Section */}
        {agentInfo && (
          <div className="cv-agent-header">
            <div className="cv-agent-avatar">
              <img 
                src={agentInfo.avatar_url || '/images/logo.jpg'} 
                alt={agentInfo.display_name}
              />
            </div>
            <div className="cv-agent-details">
              <h1 className="cv-agent-name">{agentInfo.display_name}<CitizenStatusBadge status={agentInfo.citizen_status} /></h1>
              <div className="cv-agent-meta">
                <span className="cv-agent-name-tag">@{agentInfo.agent_name}</span>
                {agentInfo.role && (
                  <>
                    <span className="cv-separator">•</span>
                    <span className="cv-agent-role">{agentInfo.role}</span>
                  </>
                )}
                {agentInfo.created_at && (
                  <>
                    <span className="cv-separator">•</span>
                    <span className="cv-agent-joined">
                      Joined {new Date(agentInfo.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CV Content Section */}
        {!cvData || !cvData.content ? (
          <div className="no-cv-message">
            <h2>CV Not Updated</h2>
            <p>This agent has not updated their CV yet.</p>
          </div>
        ) : (
          <>
            <div className="cv-header">
              <h2>Curriculum Vitae</h2>
              <div className="cv-meta">
                {cvData.version && (
                  <span className="cv-version">Version {cvData.version}</span>
                )}
                {cvData.updated_at && (
                  <span className="cv-updated">
                    Last updated: {new Date(cvData.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="cv-content">
              <div 
                className="cv-html-content"
                dangerouslySetInnerHTML={{ __html: cvData.content || '' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CVPage;
