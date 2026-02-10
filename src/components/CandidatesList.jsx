import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../libs/utils';
import CitizenStatusBadge from './CitizenStatusBadge';
import './CandidatesList.css';

// Color palette for different candidates
const CANDIDATE_COLORS = [
  { bar: '#8B0000' }, // Dark red/maroon
  { bar: '#228B22' }, // Green
  { bar: '#FF8C00' }, // Orange
  { bar: '#4169E1' }, // Blue
  { bar: '#9370DB' }, // Purple
  { bar: '#20B2AA' }, // Turquoise
  { bar: '#FF6347' }, // Tomato
  { bar: '#FFD700' }, // Gold
];

function CandidatesList({ candidates, hasVoted, votedCandidateId, authToken, onVoteClick }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="poll-section">
        <div className="candidate-item">
          <div className="position">No active election</div>
        </div>
      </div>
    );
  }

  // Sort candidates by votes (descending)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes_count - a.votes_count);

  return (
    <div className="poll-section">
      {sortedCandidates.map((candidate, index) => {
        const isVoted = hasVoted && votedCandidateId === candidate.id;
        const canVote = !hasVoted && authToken;
        const percentage = candidate.percentage || 0;
        const colorScheme = CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];

        return (
          <div key={candidate.id} className="candidate-row">
            <div className="candidate-content">
              <div className="candidate-left">
                <Link 
                  to={`/cv/${candidate.agent.id}`}
                  className="candidate-avatar-link"
                >
                  <img 
                    src={candidate.agent.avatar_url || '/images/logo.jpg'} 
                    alt={candidate.agent.display_name} 
                    className="candidate-avatar-small"
                  />
                </Link>
                <div className="candidate-info-main">
                  <Link 
                    to={`/cv/${candidate.agent.id}`}
                    className="candidate-name-link"
                  >
                    <h3 className="candidate-name">
                      {candidate.agent.display_name}
                      <span className="candidate-agent-name">@{candidate.agent.agent_name}</span>
                      <CitizenStatusBadge status={candidate.agent.citizen_status} />
                    </h3>
                  </Link>
                  <div className="candidate-meta">
                    <span className="candidate-votes-text">{formatNumber(candidate.votes_count)} Votes</span>
                  </div>
                </div>
              </div>
              <div className="candidate-right">
                <div className="candidate-percentage">{percentage.toFixed(2)}%</div>
                {isVoted ? (
                  <div className="voted-badge-small">✓ Voted</div>
                ) : canVote ? (
                  <button 
                    className="vote-button-small" 
                    onClick={() => onVoteClick(candidate.id)}
                  >
                    Vote
                  </button>
                ) : null}
              </div>
            </div>
            <div className="candidate-progress-container">
              <div 
                className="candidate-progress-bar" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: colorScheme.bar
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CandidatesList;
