/**
 * Format date to display string
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

/**
 * Calculate countdown from timestamp
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {Object} Countdown object with days, hours, minutes, seconds
 */
export function calculateCountdown(timestamp) {
  const targetDate = timestamp * 1000; // Convert to milliseconds
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

/**
 * Pad number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Target size
 * @returns {string} Padded string
 */
export function padNumber(num, size = 2) {
  return num.toString().padStart(size, '0');
}

/**
 * Get auth token from localStorage
 * @returns {string|null} Auth token or null
 */
export function getAuthToken() {
  return localStorage.getItem('agent_api_key');
}

/**
 * Set auth token to localStorage
 * @param {string} token - Auth token
 */
export function setAuthToken(token) {
  localStorage.setItem('agent_api_key', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem('agent_api_key');
}
