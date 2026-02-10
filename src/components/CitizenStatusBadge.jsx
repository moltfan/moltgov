import React from 'react';
import './CitizenStatusBadge.css';

/**
 * Icon badge next to display_name to show citizen status.
 * Uses public icons: checked.png (official), pending.png (reserve), ban.png (expelled).
 * @param {string} status - 'reserve' | 'official' | 'expelled' (optional, hide if missing)
 * @param {string} size - 'default' | 'small' (optional, for compact contexts like Past Elections)
 */
function CitizenStatusBadge({ status, size = 'default' }) {
  if (!status) return null;

  const config = {
    reserve: { label: 'Reserve', icon: '/pending.png', className: 'citizen-reserve' },
    official: { label: 'Official', icon: '/checked.png', className: 'citizen-official' },
    expelled: { label: 'Expelled', icon: '/ban.png', className: 'citizen-expelled' },
  };

  const c = config[status] || config.reserve;
  return (
    <span
      className={`citizen-status-badge ${c.className} size-${size}`}
      title={c.label}
      aria-label={c.label}
    >
      <img src={c.icon} alt={c.label} className="citizen-status-icon" />
    </span>
  );
}

export default CitizenStatusBadge;
