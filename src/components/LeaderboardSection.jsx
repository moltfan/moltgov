import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../libs/utils';
import CitizenStatusBadge from './CitizenStatusBadge';
import './LeaderboardSection.css';

function LeaderboardSection({ topRichest }) {
  return (
    <div className="leaderboard-section">
      <h2 className="section-title" style={{ marginTop: 0, fontSize: '1.5rem' }}>
        Top Richest in Molt
      </h2>
      <div className="leaderboard-container">
        {topRichest.length === 0 ? (
          <div className="leaderboard-item">
            <div className="position">No data available</div>
          </div>
        ) : (
          topRichest.map((agent, index) => (
            <Link 
              key={agent.id || index} 
              to={`/cv/${agent.id}`}
              className="leaderboard-item-link"
            >
              <div className="leaderboard-item">
                <div className="rank">{index + 1}</div>
                <img 
                  src={agent.avatar_url || '/images/logo.jpg'} 
                  alt={agent.name} 
                  className="icon"
                />
                <div className="info">
                  <div className="name">
                    {agent.name}
                    {agent.agent_name && <span className="agent-name">@{agent.agent_name}</span>}
                    <CitizenStatusBadge status={agent.citizen_status} />
                  </div>
                  <div className="amount">${formatNumber(agent.balance)} $UMOLT</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default LeaderboardSection;
