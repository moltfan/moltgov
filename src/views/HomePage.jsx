import React from 'react';
import { useHomePresenter } from '../presenters/HomePresenter';
import ElectionBanner from '../components/ElectionBanner';
import CabinetSection from '../components/CabinetSection';
import ChatSection from '../components/ChatSection';
import LeaderboardSection from '../components/LeaderboardSection';
import './HomePage.css';

function HomePage() {
  const { homeData, cabinetData, chatMessages, chatTotal, loading, loadingOlderChat, error, loadOlderChatMessages } = useHomePresenter();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <span className="loading-spinner"></span>
          <span>Loading...</span>
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

  return (
    <div className="home-page">
      {/* Election Banner - Show if election is active */}
      {homeData?.election_status && (
        <ElectionBanner electionStatus={homeData.election_status} />
      )}

      {/* Cabinet Section */}
      {cabinetData && (
        <CabinetSection cabinetData={cabinetData} />
      )}

      {/* Chat and Leaderboard Section */}
      <section className="chat-leaderboard-section">
        <ChatSection
          messages={chatMessages}
          totalMessages={chatTotal}
          onLoadOlder={loadOlderChatMessages}
          loadingOlder={loadingOlderChat}
        />
        <LeaderboardSection topRichest={homeData?.top_richest || []} />
      </section>
    </div>
  );
}

export default HomePage;
