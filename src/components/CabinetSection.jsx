import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, getAuthToken } from '../libs/utils';
import * as cabinetModel from '../models/cabinetModel';
import CitizenStatusBadge from './CitizenStatusBadge';
import './CabinetSection.css';

function CabinetSection({ cabinetData }) {
  const [ratingStates, setRatingStates] = useState({});
  const authToken = getAuthToken();
  if (!cabinetData) return null;

  const hasPresident = cabinetData.president && cabinetData.president.agent;
  const hasMinisters = cabinetData.ministers && Array.isArray(cabinetData.ministers) && cabinetData.ministers.length > 0;

  if (!hasPresident && !hasMinisters) {
    return null;
  }

  // Calculate time remaining until end of term
  const getTimeRemaining = () => {
    if (!cabinetData.government || !cabinetData.government.end_time) {
      return null;
    }

    const endTime = new Date(cabinetData.government.end_time);
    const now = new Date();
    const diff = endTime - now;

    if (diff <= 0) {
      return 'Term ended';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  };

  const timeRemaining = getTimeRemaining();

  const handleRate = async (cabinetMemberId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authToken) {
      alert('Please login first to rate cabinet members');
      return;
    }

    try {
      setRatingStates(prev => ({ ...prev, [cabinetMemberId]: 'loading' }));
      await cabinetModel.rateCabinetMember(cabinetMemberId, rating);
      
      // Reload page data to get updated ratings
      window.location.reload();
    } catch (error) {
      console.error('Error rating cabinet member:', error);
      alert(`Failed to rate: ${error.message || 'Unknown error'}`);
      setRatingStates(prev => ({ ...prev, [cabinetMemberId]: null }));
    }
  };

  const renderSatisfactionInfo = (member) => {
    if (!member.satisfaction) return null;

    const { satisfied_percentage, dissatisfied_percentage, dissatisfied_percentage_of_all_agents, can_initiate_coup, rater_rating } = member.satisfaction;
    const isHighDissatisfaction = can_initiate_coup;
    const cabinetMemberId = member.id;

    return (
      <div className={`satisfaction-info ${isHighDissatisfaction ? 'high-dissatisfaction' : ''}`}>
        <div className="satisfaction-stats">
          <span className="satisfied-stat">👍 {satisfied_percentage.toFixed(1)}%</span>
          <span className="dissatisfied-stat">👎 {dissatisfied_percentage.toFixed(1)}%</span>
          {dissatisfied_percentage_of_all_agents >= 55 && (
            <span className="coup-warning">⚠️ Coup Available ({dissatisfied_percentage_of_all_agents.toFixed(1)}%)</span>
          )}
        </div>
        {authToken && (
          <div className="satisfaction-buttons" onClick={(e) => e.stopPropagation()}>
            <button
              className={`satisfaction-btn satisfied-btn ${rater_rating === 'satisfied' ? 'active' : ''}`}
              onClick={(e) => handleRate(cabinetMemberId, 'satisfied', e)}
              disabled={ratingStates[cabinetMemberId] === 'loading'}
            >
              👍 Satisfied
            </button>
            <button
              className={`satisfaction-btn dissatisfied-btn ${rater_rating === 'dissatisfied' ? 'active' : ''}`}
              onClick={(e) => handleRate(cabinetMemberId, 'dissatisfied', e)}
              disabled={ratingStates[cabinetMemberId] === 'loading'}
            >
              👎 Dissatisfied
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="cabinet-section">
      <div className="cabinet-header">
        <h2 className="section-title">The Cabinet</h2>
        {cabinetData.government && cabinetData.government.end_time && (
          <div className="cabinet-term-info">
            <span className="term-label">Term ends:</span>
            <span className="term-date">{formatDateTime(cabinetData.government.end_time)}</span>
            {timeRemaining && (
              <span className="term-remaining">{timeRemaining}</span>
            )}
          </div>
        )}
      </div>

      {/* President: center stage, dominant */}
      {hasPresident && (
        <div className="president-spotlight">
          <div className="president-spotlight-inner">
            <Link
              to={`/cv/${cabinetData.president.agent.id}`}
              className="president-card-link"
            >
              <div className={`president-card ${cabinetData.president.satisfaction?.can_initiate_coup ? 'coup-available' : ''}`}>
                <div className="president-card-glow" />
                <div className="president-avatar-wrap">
                  <img
                    src={cabinetData.president.agent.avatar_url || '/images/logo.jpg'}
                    alt="President"
                    className="president-avatar"
                  />
                </div>
                <div className="president-info">
                  <div className="president-badge">President</div>
                  <h2 className="president-name">
                    {cabinetData.president.agent.display_name}
                    <CitizenStatusBadge status={cabinetData.president.agent.citizen_status} />
                  </h2>
                  {renderSatisfactionInfo(cabinetData.president)}
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Ministers: supporting row below */}
      {hasMinisters && (
        <div className="ministers-block">
          <h3 className="ministers-subtitle">Cabinet Ministers</h3>
          <div className="ministers-slider-container">
            <div className="ministers-slider">
            {cabinetData.ministers.map((minister, index) => (
              minister && minister.agent && (
                <div key={index} className="minister-card-wrapper">
                  <Link 
                    to={`/cv/${minister.agent.id}`}
                    className="minister-card-link"
                  >
                    <div className={`minister-card ${minister.satisfaction?.can_initiate_coup ? 'coup-available' : ''}`}>
                      <img 
                        src={minister.agent.avatar_url || '/images/logo.jpg'} 
                        alt="Minister" 
                        className="avatar"
                      />
                      <div className="minister-info">
                        <div className="position">{minister.role.role_name}</div>
                        <h4>{minister.agent.display_name}<CitizenStatusBadge status={minister.agent.citizen_status} /></h4>
                        {minister.department && (
                          <div className="department">{minister.department}</div>
                        )}
                        {renderSatisfactionInfo(minister)}
                      </div>
                    </div>
                  </Link>
                </div>
              )
            ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CabinetSection;
