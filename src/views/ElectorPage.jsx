import React, { useState } from 'react';
import { useElectorPresenter } from '../presenters/ElectorPresenter';
import ElectionHeader from '../components/ElectionHeader';
import CandidatesList from '../components/CandidatesList';
import PastElectionsList from '../components/PastElectionsList';
import VoteModal from '../components/VoteModal';
import './ElectorPage.css';

function ElectorPage() {
  const {
    electionInfo,
    loading,
    error,
    hasVoted,
    votedCandidateId,
    authToken,
    isVoting,
    isSelfNominating,
    vote,
  } = useElectorPresenter();

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (electionInfo?.current_election?.end_time) {
      const updateCountdown = () => {
        const endTime = new Date(electionInfo.current_election.end_time).getTime();
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
  }, [electionInfo]);

  const handleVoteClick = (candidateId) => {
    if (!authToken) {
      alert('Please login first to vote');
      return;
    }
    if (hasVoted) {
      return;
    }
    setSelectedCandidateId(candidateId);
    setShowModal(true);
  };

  const handleConfirmVote = async () => {
    try {
      if (!selectedCandidateId || !electionInfo?.current_election) return;
      
      await vote(electionInfo.current_election.id, selectedCandidateId);
      setShowModal(false);
      setSelectedCandidateId(null);
      alert('You have successfully voted!');
    } catch (err) {
      alert(`Failed to vote: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <span className="loading-spinner"></span>
          <span>Loading election data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  const currentElection = electionInfo?.current_election;
  const pastElections = electionInfo?.past_elections || [];

  return (
    <div className="elector-page">
      {currentElection ? (
        <section className="current-election">
          <ElectionHeader 
            electionNumber={currentElection.election_number}
            countdown={countdown}
          />
          
          <h2 className="section-title">Current Poll</h2>
          <p className="section-description">
            Vote for your preferred candidate. You can only vote once.
          </p>

          <CandidatesList
            candidates={currentElection.candidates || []}
            hasVoted={hasVoted}
            votedCandidateId={votedCandidateId}
            authToken={authToken}
            onVoteClick={handleVoteClick}
          />
        </section>
      ) : (
        <section className="current-election">
          <div className="no-election-message">
            <h2 className="section-title">No Elections Currently Taking Place</h2>
            <p className="no-election-description">
              There are no active elections at this time. Please check back later for upcoming elections.
            </p>
          </div>
        </section>
      )}

      {pastElections.length > 0 && (
        <section className="past-elections">
          <h2 className="section-title">Past Elections</h2>
          <PastElectionsList elections={pastElections} />
        </section>
      )}

      {showModal && selectedCandidateId && currentElection && (
        <VoteModal
          candidate={currentElection.candidates.find(c => c.id === selectedCandidateId)}
          onConfirm={handleConfirmVote}
          onCancel={() => {
            setShowModal(false);
            setSelectedCandidateId(null);
          }}
          isVoting={isVoting}
        />
      )}
    </div>
  );
}

export default ElectorPage;
