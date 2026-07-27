import axios from 'axios';
import { TOKEN_KEY } from '../utils/constants';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT automatically to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// A single place other parts of the app can subscribe to for global,
// cross-cutting auth/error events (401 -> force logout, toasts, etc.)
const listeners = new Set();
export const onApiEvent = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = (event) => listeners.forEach((fn) => fn(event));

/**
 * Normalizes every backend error shape into { message, fieldErrors, status }.
 * Backend error shapes:
 *  - ApiErrorResponse: { timestamp, status, error, message, path }
 *  - Validation map: { fieldName: "message", ... }  (HTTP 400)
 */
export const parseApiError = (error) => {
  if (!error.response) {
    return {
      status: 0,
      message: 'Unable to reach the server. Please check your connection and try again.',
      fieldErrors: null,
    };
  }

  const { status, data } = error.response;

  if (data && typeof data === 'object' && !data.message && !data.error) {
    // Validation error map { field: message }
    const fieldErrors = data;
    const firstMessage = Object.values(fieldErrors)[0];
    return { status, message: firstMessage || 'Please check the form and try again.', fieldErrors };
  }

  if (data && (data.message || data.error)) {
    return { status, message: data.message || data.error, fieldErrors: null };
  }

  if (typeof data === 'string' && data.trim()) {
    return { status, message: data, fieldErrors: null };
  }

  const fallback = {
    400: 'That request could not be processed.',
    401: 'Your session has expired. Please log in again.',
    403: "You don't have permission to do that.",
    404: 'The requested resource was not found.',
    500: 'Something went wrong on our end. Please try again later.',
  };

  return { status, message: fallback[status] || 'Something went wrong. Please try again.', fieldErrors: null };
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsed = parseApiError(error);

    if (parsed.status === 401) {
      emit({ type: 'UNAUTHORIZED', message: parsed.message });
    } else if (parsed.status === 403) {
      emit({ type: 'FORBIDDEN', message: parsed.message });
    } else if (parsed.status === 500) {
      emit({ type: 'SERVER_ERROR', message: parsed.message });
    } else if (parsed.status === 0) {
      emit({ type: 'NETWORK_ERROR', message: parsed.message });
    }

    return Promise.reject(parsed);
  },
);

export default apiClient;
