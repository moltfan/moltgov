/**
 * Request Guard - Prevents duplicate API calls in React StrictMode
 * Uses module-level state to track active requests and share data via Promises
 */

const activeRequests = new Map();

/**
 * Check if a request is already in progress and get its promise, or create new one
 * This is atomic - only one call can succeed
 * @param {string} key - Unique key for the request (e.g., 'home', 'election', 'cv:123')
 * @param {Function} requestFn - Function that returns a Promise for the request
 * @returns {Promise} Promise that resolves with the data
 */
export function getOrCreateRequest(key, requestFn) {
  const existing = activeRequests.get(key);
  
  if (existing) {
    // Check if request is still recent (within 2 seconds)
    const now = Date.now();
    if (now - existing.timestamp > 2000) {
      // Request is old, remove it and create new one
      activeRequests.delete(key);
    } else {
      // Return existing promise
      return existing.promise;
    }
  }
  
  // Create new request
  const promise = requestFn().then(
    (data) => {
      // Request completed, remove from active requests
      activeRequests.delete(key);
      return data;
    },
    (error) => {
      // Request failed, remove from active requests
      activeRequests.delete(key);
      throw error;
    }
  );
  
  activeRequests.set(key, {
    timestamp: Date.now(),
    promise: promise
  });
  
  return promise;
}

/**
 * Check if a request is already in progress
 * @param {string} key - Unique key for the request
 * @returns {boolean} True if request is already active
 */
export function isRequestActive(key) {
  const request = activeRequests.get(key);
  if (!request) return false;
  
  // Check if request is still recent (within 2 seconds)
  const now = Date.now();
  if (now - request.timestamp > 2000) {
    // Request is old, remove it
    activeRequests.delete(key);
    return false;
  }
  
  return true;
}

/**
 * Mark a request as active
 * @param {string} key - Unique key for the request
 */
export function setRequestActive(key) {
  activeRequests.set(key, {
    timestamp: Date.now()
  });
}

/**
 * Mark a request as completed
 * @param {string} key - Unique key for the request
 */
export function setRequestComplete(key) {
  activeRequests.delete(key);
}

/**
 * Clear all active requests (useful for cleanup)
 */
export function clearAllRequests() {
  activeRequests.clear();
}
