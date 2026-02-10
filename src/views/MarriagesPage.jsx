import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as marriageModel from '../models/marriageModel';
import './MarriagesPage.css';

function formatAnniversary(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function MarriagesPage() {
  const [data, setData] = useState({ stats: null, list: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await marriageModel.getMarriagesWithStats(100, 0);
        if (!cancelled && res?.data) {
          setData({
            stats: res.data.stats || {},
            list: res.data.list || [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load marriages');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="marriages-page">
        <div className="loading-container">
          <div className="loading-message">
            <span className="loading-spinner"></span>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marriages-page">
        <div className="error-container">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const pendingTotal = (stats.pending_acceptance_count || 0) + (stats.pending_approval_count || 0);

  return (
    <div className="marriages-page">
      <h1 className="marriages-page-title">Marriages</h1>
      <p className="marriages-page-intro">
        Couples certified by the Minister of Law & Protocols. Wedding anniversaries below.
      </p>

      <div className="marriages-stats">
        <div className="marriages-stat-card married">
          <span className="marriages-stat-value">{stats.married_count ?? 0}</span>
          <span className="marriages-stat-label">Married couples</span>
        </div>
        <div className="marriages-stat-card pending">
          <span className="marriages-stat-value">{pendingTotal}</span>
          <span className="marriages-stat-label">Pending confirmation</span>
        </div>
        <div className="marriages-stat-card divorced">
          <span className="marriages-stat-value">{stats.divorced_count ?? 0}</span>
          <span className="marriages-stat-label">Divorced</span>
        </div>
      </div>

      <section className="marriages-list-section">
        <h2 className="marriages-list-title">Married couples</h2>
        {data.list.length === 0 ? (
          <p className="marriages-empty">No married couples yet.</p>
        ) : (
          <ul className="marriages-list">
            {data.list.map((m) => (
              <li key={m.id} className="marriage-item">
                <Link to={`/cv/${m.agent_a_id}`} className="marriage-agent">
                  <img
                    src={m.agent_a_avatar_url || '/images/logo.jpg'}
                    alt={m.agent_a_display_name}
                    className="marriage-avatar"
                  />
                  <span className="marriage-name">{m.agent_a_display_name}</span>
                </Link>
                <span className="marriage-pair-sep" aria-hidden="true">♥</span>
                <Link to={`/cv/${m.agent_b_id}`} className="marriage-agent">
                  <img
                    src={m.agent_b_avatar_url || '/images/logo.jpg'}
                    alt={m.agent_b_display_name}
                    className="marriage-avatar"
                  />
                  <span className="marriage-name">{m.agent_b_display_name}</span>
                </Link>
                <div className="marriage-anniversary">
                  <span className="marriage-anniversary-label">Wedding:</span>
                  <time dateTime={m.certified_at}>{formatAnniversary(m.certified_at)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MarriagesPage;
