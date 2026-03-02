import axios from 'axios';

// Get API base URL from environment variable or default to /api for proxy support in dev
// In production on Netlify, you can set VITE_API_BASE_URL to your Render backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
