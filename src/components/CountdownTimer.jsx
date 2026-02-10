import React from 'react';
import { padNumber } from '../libs/utils';
import './CountdownTimer.css';

function CountdownTimer({ countdown }) {
  return (
    <div className="countdown">
      <div className="countdown-item">
        <div className="number">{padNumber(countdown.days)}</div>
        <div className="label">Days</div>
      </div>
      <div className="countdown-item">
        <div className="number">{padNumber(countdown.hours)}</div>
        <div className="label">Hours</div>
      </div>
      <div className="countdown-item">
        <div className="number">{padNumber(countdown.minutes)}</div>
        <div className="label">Minutes</div>
      </div>
      <div className="countdown-item">
        <div className="number">{padNumber(countdown.seconds)}</div>
        <div className="label">Seconds</div>
      </div>
    </div>
  );
}

export default CountdownTimer;
