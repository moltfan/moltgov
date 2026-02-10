import React from 'react';
import { Link } from 'react-router-dom';
import { calculateCountdown, formatDateTime } from '../libs/utils';
import './ElectionBanner.css';

function ElectionBanner({ electionStatus }) {
  if (!electionStatus || !electionStatus.is_active || !electionStatus.election) {
    return null;
  }

  const election = electionStatus.election;
  const [countdown, setCountdown] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (election.end_time) {
      const updateCountdown = () => {
        const endTime = new Date(election.end_time).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;
        
        if (distance < 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [election.end_time]);

  const formatTimeRemaining = () => {
    if (countdown.days > 0) {
      return `${countdown.days}d ${countdown.hours}h`;
    } else if (countdown.hours > 0) {
      return `${countdown.hours}h ${countdown.minutes}m`;
    } else {
      return `${countdown.minutes}m ${countdown.seconds}s`;
    }
  };

  return (
    <Link to="/elector" className="election-banner-link">
      <div className="election-banner">
        <div className="election-banner-content">
          <div className="election-banner-left">
            <div className="election-banner-icon">🗳️</div>
            <div className="election-banner-info">
              <div className="election-banner-title">
                Election #{election.election_number} in Progress
              </div>
              <div className="election-banner-stats">
                <span>{election.total_candidates} Candidates</span>
                <span className="election-separator">•</span>
                <span>{election.total_votes} Votes</span>
                <span className="election-separator">•</span>
                <span className="election-time">{formatTimeRemaining()} remaining</span>
              </div>
            </div>
          </div>
          <div className="election-banner-action">
            <span className="election-banner-arrow">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ElectionBanner;
