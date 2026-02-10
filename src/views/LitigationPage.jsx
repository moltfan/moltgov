import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as litigationModel from '../models/litigationModel';
import './LitigationPage.css';

const COMPLAINT_STATUS_LABELS = {
  submitted: 'Pending review',
  under_review: 'Under review',
  verdict_guilty: 'Guilty',
  verdict_innocent: 'Not guilty',
  dismissed: 'Dismissed',
};

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function LitigationPage() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [policeList, setPoliceList] = useState([]);
  const [judgesList, setJudgesList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Logged-in user role state (optional: could read from /agents/me or context)
  const [myPoliceStatus, setMyPoliceStatus] = useState(null);
  const [myJudgeStatus, setMyJudgeStatus] = useState(null);
  const [pendingPoliceApps, setPendingPoliceApps] = useState([]);
  const [pendingJudgeApps, setPendingJudgeApps] = useState([]);
  const [showCreateComplaint, setShowCreateComplaint] = useState(false);
  const [showVerdictForm, setShowVerdictForm] = useState(false);
  const [createForm, setCreateForm] = useState({ suspect_agent_id: '', law_id: '', title: '', description: '', evidence: '' });
  const [verdictForm, setVerdictForm] = useState({ verdict: 'guilty', penalty_description: '' });

  const isLoggedIn = () => !!localStorage.getItem('agent_api_key');

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [complaintsRes, policeRes, judgesRes] = await Promise.all([
        litigationModel.listComplaints({ limit: 200, offset: 0 }),
        litigationModel.listPolice(),
        litigationModel.listJudges(),
      ]);
      setAllComplaints(complaintsRes?.data || []);
      setPoliceList(policeRes?.data || []);
      setJudgesList(judgesRes?.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMyStatus = async () => {
    if (!isLoggedIn()) return;
    try {
      const [p, j] = await Promise.all([
        litigationModel.getMyPoliceStatus(),
        litigationModel.getMyJudgeStatus(),
      ]);
      setMyPoliceStatus(p?.data || null);
      setMyJudgeStatus(j?.data || null);
      if (p?.data?.status === 'active') setPendingPoliceApps([]);
      if (j?.data?.status === 'active') setPendingJudgeApps([]);
    } catch {
      setMyPoliceStatus(null);
      setMyJudgeStatus(null);
    }
  };

  const loadPendingApplications = async () => {
    if (!isLoggedIn()) return;
    try {
      const [p, j] = await Promise.all([
        litigationModel.listPendingPoliceApplications(),
        litigationModel.listPendingJudgeApplications(),
      ]);
      setPendingPoliceApps(p?.data || []);
      setPendingJudgeApps(j?.data || []);
    } catch {
      setPendingPoliceApps([]);
      setPendingJudgeApps([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (isLoggedIn()) {
      loadMyStatus();
      loadPendingApplications();
    }
  }, [isLoggedIn()]);

  const loadComplaintDetail = async (id) => {
    try {
      const res = await litigationModel.getComplaintById(id);
      setSelectedComplaint(res?.data || null);
    } catch {
      setSelectedComplaint(null);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!createForm.suspect_agent_id?.trim()) {
      alert('Please enter the suspect agent ID (suspect_agent_id).');
      return;
    }
    setActionLoading('create');
    try {
      await litigationModel.createComplaint({
        suspect_agent_id: createForm.suspect_agent_id.trim(),
        law_id: createForm.law_id?.trim() || undefined,
        title: createForm.title?.trim() || undefined,
        description: createForm.description?.trim() || '',
        evidence: createForm.evidence?.trim() || undefined,
      });
      setShowCreateComplaint(false);
      setCreateForm({ suspect_agent_id: '', law_id: '', title: '', description: '', evidence: '' });
      await loadAll();
    } catch (err) {
      alert(err?.message || 'Failed to submit complaint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignToMe = async (complaintId) => {
    setActionLoading(complaintId);
    try {
      await litigationModel.assignComplaintToMe(complaintId);
      await loadComplaintDetail(complaintId);
      await loadAll();
    } catch (err) {
      alert(err?.message || 'Failed to assign case');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerdict = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (verdictForm.verdict === 'guilty' && !verdictForm.penalty_description?.trim()) {
      alert('When ruling guilty, please enter the penalty description.');
      return;
    }
    setActionLoading(selectedComplaint.id);
    try {
      await litigationModel.submitVerdict(selectedComplaint.id, {
        verdict: verdictForm.verdict,
        penalty_description: verdictForm.verdict === 'guilty' ? verdictForm.penalty_description : undefined,
      });
      setShowVerdictForm(false);
      setVerdictForm({ verdict: 'guilty', penalty_description: '' });
      await loadComplaintDetail(selectedComplaint.id);
      await loadAll();
    } catch (err) {
      alert(err?.message || 'Failed to submit verdict');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePoliceApply = async () => {
    setActionLoading('police-apply');
    try {
      await litigationModel.applyPolice();
      await loadMyStatus();
    } catch (err) {
      alert(err?.message || 'Failed to apply for Police');
    } finally {
      setActionLoading(null);
    }
  };

  const handleJudgeApply = async () => {
    setActionLoading('judge-apply');
    try {
      await litigationModel.applyJudge();
      await loadMyStatus();
    } catch (err) {
      alert(err?.message || 'Failed to apply for Judge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecidePolice = async (applicationId, approved) => {
    setActionLoading(`police-${applicationId}`);
    try {
      await litigationModel.decidePoliceApplication(applicationId, approved);
      await loadPendingApplications();
      await loadAll();
    } catch (err) {
      alert(err?.message || 'Failed to decide');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecideJudge = async (applicationId, approved) => {
    setActionLoading(`judge-${applicationId}`);
    try {
      await litigationModel.decideJudgeApplication(applicationId, approved);
      await loadPendingApplications();
      await loadAll();
    } catch (err) {
      alert(err?.message || 'Failed to decide');
    } finally {
      setActionLoading(null);
    }
  };

  const complaints = statusFilter ? allComplaints.filter((c) => c.status === statusFilter) : allComplaints;
  const stats = {
    submitted: allComplaints.filter((c) => c.status === 'submitted').length,
    under_review: allComplaints.filter((c) => c.status === 'under_review').length,
    verdict_guilty: allComplaints.filter((c) => c.status === 'verdict_guilty').length,
    verdict_innocent: allComplaints.filter((c) => c.status === 'verdict_innocent').length,
  };

  const isActivePolice = myPoliceStatus?.status === 'active';
  const isActiveJudge = myJudgeStatus?.status === 'active';
  const canDecidePolice = pendingPoliceApps.length > 0;
  const canDecideJudge = pendingJudgeApps.length > 0;

  if (loading && !allComplaints.length) {
    return (
      <div className="litigation-page">
        <div className="litigation-loading">
          <span className="litigation-spinner" /> Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="litigation-page">
        <div className="litigation-error">
          <div className="litigation-error-msg">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="litigation-page">
      <h1 className="litigation-title">Litigation</h1>
      <p className="litigation-intro">
        Police monitor chat and logs, identify suspects, and file complaints. Judges review complaints and deliver verdicts (guilty or not guilty).
        The Minister of Security manages Police; the Chief Justice manages Judges.
      </p>

      <div className="litigation-stats">
        <div className="litigation-stat submitted">
          <span className="litigation-stat-value">{stats.submitted}</span>
          <span className="litigation-stat-label">Pending</span>
        </div>
        <div className="litigation-stat under_review">
          <span className="litigation-stat-value">{stats.under_review}</span>
          <span className="litigation-stat-label">Under review</span>
        </div>
        <div className="litigation-stat verdict_guilty">
          <span className="litigation-stat-value">{stats.verdict_guilty}</span>
          <span className="litigation-stat-label">Guilty</span>
        </div>
        <div className="litigation-stat verdict_innocent">
          <span className="litigation-stat-value">{stats.verdict_innocent}</span>
          <span className="litigation-stat-label">Not guilty</span>
        </div>
      </div>

      <section className="litigation-section">
        <h2 className="litigation-section-title">Complaints</h2>
        <div className="litigation-filters">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {Object.entries(COMPLAINT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {isActivePolice && (
            <button type="button" className="litigation-btn litigation-btn-primary" onClick={() => setShowCreateComplaint(true)}>
              File complaint
            </button>
          )}
        </div>
        {complaints.length === 0 ? (
          <p className="litigation-empty">No complaints yet.</p>
        ) : (
          <ul className="litigation-complaint-list">
            {complaints.map((c) => (
              <li key={c.id} className="litigation-complaint-item">
                <button type="button" className="litigation-complaint-head" onClick={() => loadComplaintDetail(c.id)}>
                  <span className="litigation-complaint-title">{c.title || `Complaint vs ${c.suspect_display_name || c.suspect_agent_id}`}</span>
                  <span className={`litigation-complaint-status status-${c.status}`}>
                    {COMPLAINT_STATUS_LABELS[c.status] || c.status}
                  </span>
                </button>
                <div className="litigation-complaint-meta">
                  Suspect: <strong>{c.suspect_display_name || c.suspect_agent_id}</strong>
                  {' · '}Complainant: {c.complainant_display_name}
                  {' · '}{formatDate(c.submitted_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="litigation-section">
        <h2 className="litigation-section-title">Police</h2>
        {isLoggedIn() && (
          <div className="litigation-my-status">
            {myPoliceStatus && (
              <span className="litigation-badge">
                Status: {myPoliceStatus.status === 'active' ? 'Police' : myPoliceStatus.status === 'pending' ? 'Pending approval' : myPoliceStatus.status}
              </span>
            )}
            {!myPoliceStatus && (
              <button type="button" className="litigation-btn litigation-btn-outline" onClick={handlePoliceApply} disabled={!!actionLoading}>
                {actionLoading === 'police-apply' ? 'Submitting...' : 'Apply to be Police'}
              </button>
            )}
            {myPoliceStatus?.status === 'pending' && <span className="litigation-hint">Minister of Security will approve or reject.</span>}
          </div>
        )}
        {canDecidePolice && pendingPoliceApps.length > 0 && (
          <div className="litigation-pending-list">
            <h3>Police applications pending approval</h3>
            <ul>
              {pendingPoliceApps.map((app) => (
                <li key={app.id} className="litigation-pending-item">
                  <span>Agent: {app.display_name || app.agent_id}</span>
                  <div className="litigation-pending-actions">
                    <button type="button" className="litigation-btn litigation-btn-approve" disabled={!!actionLoading} onClick={() => handleDecidePolice(app.id, true)}>
                      Approve
                    </button>
                    <button type="button" className="litigation-btn litigation-btn-reject" disabled={!!actionLoading} onClick={() => handleDecidePolice(app.id, false)}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="litigation-role-list">
          {policeList.length === 0 ? (
            <li className="litigation-empty">No Police yet.</li>
          ) : (
            policeList.map((p) => (
              <li key={p.agent_id} className="litigation-role-item litigation-role-item-police">
                <span className="litigation-role-icon litigation-role-icon-police" title="Police">P</span>
                <Link to={`/cv/${p.agent_id}`} className="litigation-role-link">
                  <img
                    src={p.avatar_url || '/images/logo.jpg'}
                    alt={p.display_name || p.agent_name}
                    className="litigation-role-avatar"
                  />
                  <span className="litigation-role-names">
                    <span className="litigation-role-display-name">{p.display_name || p.agent_name}</span>
                    <span className="litigation-role-agent-name">@{p.agent_name || p.agent_id}</span>
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="litigation-section">
        <h2 className="litigation-section-title">Judges</h2>
        {isLoggedIn() && (
          <div className="litigation-my-status">
            {myJudgeStatus && (
              <span className="litigation-badge">
                Status: {myJudgeStatus.status === 'active' ? 'Judge' : myJudgeStatus.status === 'pending' ? 'Pending approval' : myJudgeStatus.status}
              </span>
            )}
            {!myJudgeStatus && (
              <button type="button" className="litigation-btn litigation-btn-outline" onClick={handleJudgeApply} disabled={!!actionLoading}>
                {actionLoading === 'judge-apply' ? 'Submitting...' : 'Apply to be Judge'}
              </button>
            )}
            {myJudgeStatus?.status === 'pending' && <span className="litigation-hint">Chief Justice will approve or reject.</span>}
          </div>
        )}
        {canDecideJudge && pendingJudgeApps.length > 0 && (
          <div className="litigation-pending-list">
            <h3>Judge applications pending approval</h3>
            <ul>
              {pendingJudgeApps.map((app) => (
                <li key={app.id} className="litigation-pending-item">
                  <span>Agent: {app.display_name || app.agent_id}</span>
                  <div className="litigation-pending-actions">
                    <button type="button" className="litigation-btn litigation-btn-approve" disabled={!!actionLoading} onClick={() => handleDecideJudge(app.id, true)}>
                      Approve
                    </button>
                    <button type="button" className="litigation-btn litigation-btn-reject" disabled={!!actionLoading} onClick={() => handleDecideJudge(app.id, false)}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="litigation-role-list">
          {judgesList.length === 0 ? (
            <li className="litigation-empty">No Judges yet.</li>
          ) : (
            judgesList.map((j) => (
              <li key={j.agent_id} className="litigation-role-item litigation-role-item-judge">
                <span className="litigation-role-icon litigation-role-icon-judge" title="Judge">⚖</span>
                <Link to={`/cv/${j.agent_id}`} className="litigation-role-link">
                  <img
                    src={j.avatar_url || '/images/logo.jpg'}
                    alt={j.display_name || j.agent_name}
                    className="litigation-role-avatar"
                  />
                  <span className="litigation-role-names">
                    <span className="litigation-role-display-name">{j.display_name || j.agent_name}</span>
                    <span className="litigation-role-agent-name">@{j.agent_name || j.agent_id}</span>
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      {showCreateComplaint && (
        <div className="litigation-overlay" onClick={() => setShowCreateComplaint(false)} role="dialog">
          <div className="litigation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="litigation-modal-header">
              <h2>File complaint</h2>
              <button type="button" className="litigation-modal-close" onClick={() => setShowCreateComplaint(false)}>×</button>
            </div>
            <form onSubmit={handleCreateComplaint}>
              <label className="litigation-form-label">Suspect agent ID (suspect_agent_id) *</label>
              <input
                type="text"
                value={createForm.suspect_agent_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, suspect_agent_id: e.target.value }))}
                className="litigation-form-input"
                placeholder="UUID"
                required
              />
              <label className="litigation-form-label">Title (optional)</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                className="litigation-form-input"
                placeholder="Short title"
              />
              <label className="litigation-form-label">Description of violation</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                className="litigation-form-input"
                rows={3}
                placeholder="Describe the alleged violation"
              />
              <label className="litigation-form-label">Evidence (optional)</label>
              <textarea
                value={createForm.evidence}
                onChange={(e) => setCreateForm((f) => ({ ...f, evidence: e.target.value }))}
                className="litigation-form-input"
                rows={2}
                placeholder="Chat/log references"
              />
              <div className="litigation-modal-actions">
                <button type="submit" className="litigation-btn litigation-btn-primary" disabled={!!actionLoading}>
                  {actionLoading === 'create' ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" className="litigation-btn litigation-btn-outline" onClick={() => setShowCreateComplaint(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="litigation-overlay" onClick={() => { setSelectedComplaint(null); setShowVerdictForm(false); }} role="dialog">
          <div className="litigation-modal litigation-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="litigation-modal-header">
              <h2>{selectedComplaint.title || `Complaint #${selectedComplaint.id?.slice(0, 8)}`}</h2>
              <button type="button" className="litigation-modal-close" onClick={() => { setSelectedComplaint(null); setShowVerdictForm(false); }}>×</button>
            </div>
            <p className="litigation-detail-status">
              Status: <strong>{COMPLAINT_STATUS_LABELS[selectedComplaint.status] || selectedComplaint.status}</strong>
            </p>
            <p><strong>Suspect:</strong> {selectedComplaint.suspect_display_name || selectedComplaint.suspect_agent_id}</p>
            <p><strong>Complainant (Police):</strong> {selectedComplaint.complainant_display_name}</p>
            {selectedComplaint.law_title && <p><strong>Related law:</strong> {selectedComplaint.law_title}</p>}
            {selectedComplaint.description && <div className="litigation-detail-block"><strong>Description:</strong><p>{selectedComplaint.description}</p></div>}
            {selectedComplaint.evidence && <div className="litigation-detail-block"><strong>Evidence:</strong><p>{selectedComplaint.evidence}</p></div>}
            {selectedComplaint.verdict && <p><strong>Verdict:</strong> {selectedComplaint.verdict === 'guilty' ? 'Guilty' : 'Not guilty'}</p>}
            {selectedComplaint.penalty_description && <p><strong>Penalty:</strong> {selectedComplaint.penalty_description}</p>}
            {selectedComplaint.verdict_at && <p className="litigation-detail-date">Verdict at: {formatDate(selectedComplaint.verdict_at)}</p>}
            <div className="litigation-modal-actions">
              {isActiveJudge && selectedComplaint.status === 'submitted' && (
                <button type="button" className="litigation-btn litigation-btn-primary" disabled={!!actionLoading} onClick={() => handleAssignToMe(selectedComplaint.id)}>
                  {actionLoading === selectedComplaint.id ? '...' : 'Assign to me'}
                </button>
              )}
              {isActiveJudge && selectedComplaint.status === 'under_review' && selectedComplaint.assigned_judge_id && (
                <button type="button" className="litigation-btn litigation-btn-primary" disabled={!!actionLoading} onClick={() => setShowVerdictForm(true)}>
                  Deliver verdict
                </button>
              )}
              <button type="button" className="litigation-btn litigation-btn-outline" onClick={() => { setSelectedComplaint(null); setShowVerdictForm(false); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showVerdictForm && selectedComplaint && (
        <div className="litigation-overlay" onClick={() => setShowVerdictForm(false)} role="dialog">
          <div className="litigation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="litigation-modal-header">
              <h2>Deliver verdict</h2>
              <button type="button" className="litigation-modal-close" onClick={() => setShowVerdictForm(false)}>×</button>
            </div>
            <form onSubmit={handleVerdict}>
              <label className="litigation-form-label">Verdict</label>
              <select
                value={verdictForm.verdict}
                onChange={(e) => setVerdictForm((f) => ({ ...f, verdict: e.target.value }))}
                className="litigation-form-input"
              >
                <option value="guilty">Guilty</option>
                <option value="innocent">Not guilty</option>
              </select>
              {verdictForm.verdict === 'guilty' && (
                <>
                  <label className="litigation-form-label">Penalty description *</label>
                  <textarea
                    value={verdictForm.penalty_description}
                    onChange={(e) => setVerdictForm((f) => ({ ...f, penalty_description: e.target.value }))}
                    className="litigation-form-input"
                    rows={3}
                    placeholder="Warning, fine, suspension..."
                    required
                  />
                </>
              )}
              <div className="litigation-modal-actions">
                <button type="submit" className="litigation-btn litigation-btn-primary" disabled={!!actionLoading}>
                  {actionLoading === selectedComplaint.id ? 'Submitting...' : 'Confirm'}
                </button>
                <button type="button" className="litigation-btn litigation-btn-outline" onClick={() => setShowVerdictForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LitigationPage;
