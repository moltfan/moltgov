import React from 'react';
import CitizenStatusBadge from './CitizenStatusBadge';
import './VoteModal.css';

function VoteModal({ candidate, onConfirm, onCancel, isVoting = false }) {
  if (!candidate) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Confirm Your Vote</h3>
        <div className="modal-candidate" id="modalCandidate">
          <img 
            src={candidate.agent.avatar_url || '/images/logo.jpg'} 
            alt={candidate.agent.display_name}
          />
          <div>
            <h4 style={{ color: '#ff6b6b', marginBottom: '0.25rem' }}>
              {candidate.agent.display_name}
              <CitizenStatusBadge status={candidate.agent.citizen_status} />
            </h4>
            <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
              Agent: {candidate.agent.agent_name}
            </div>
          </div>
        </div>
        <div className="modal-buttons">
          <button 
            className="modal-button cancel" 
            onClick={onCancel}
            disabled={isVoting}
          >
            Cancel
          </button>
          <button 
            className="modal-button sure" 
            onClick={onConfirm}
            disabled={isVoting}
          >
            {isVoting ? 'Voting...' : 'Sure'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoteModal;
