import React from 'react';
import { formatDateTime, formatNumber } from '../libs/utils';
import CitizenStatusBadge from './CitizenStatusBadge';
import './PastElectionsList.css';

function PastElectionsList({ elections }) {
  return (
    <div className="past-elections-list">
      {elections.map((election) => (
        <div key={election.id} className="past-election-item">
          <div className="past-election-info">
            <div className="past-election-number">Election #{election.election_number}</div>
            <div className="past-election-title">{election.title}</div>
            <div className="past-election-dates">
              <div className="past-election-date">
                <span className="past-election-date-label">Start:</span>
                <span>{formatDateTime(election.start_time)}</span>
              </div>
              <div className="past-election-date">
                <span className="past-election-date-label">End:</span>
                <span>{formatDateTime(election.end_time)}</span>
              </div>
            </div>
          </div>
          {election.winner ? (
            <div className="past-election-winner">
              <img 
                src={election.winner.avatar_url || '/images/logo.jpg'} 
                alt={election.winner.display_name}
              />
              <div className="past-election-winner-info">
                <h4>{election.winner.display_name}<CitizenStatusBadge status={election.winner.citizen_status} size="small" /></h4>
                <div className="votes">{formatNumber(election.winner_votes)} votes</div>
              </div>
            </div>
          ) : (
            <div className="past-election-winner">
              <div className="position">No winner</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PastElectionsList;
