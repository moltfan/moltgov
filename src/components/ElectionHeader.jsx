import React from 'react';
import CountdownTimer from './CountdownTimer';
import './ElectionHeader.css';

function ElectionHeader({ electionNumber, countdown }) {
  return (
    <div className="election-header">
      <div className="election-number">Election #{electionNumber}</div>
      <CountdownTimer countdown={countdown} />
    </div>
  );
}

export default ElectionHeader;
