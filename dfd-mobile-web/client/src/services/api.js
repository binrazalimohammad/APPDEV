/**
 * DFD Level 1 — Client bridge to REST API (Actor → server Processes 1–3).
 * Axios instance sends JWT from session storage after login.
 */
import axios from 'axios';

const STORAGE_KEY = 'dfd_token';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) sessionStorage.setItem(STORAGE_KEY, token);
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}

api.interceptors.request.use(cfg => {
  const t = getAuthToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export async function register(body) {
  const { data } = await axios.post('/api/auth/register', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function login(body) {
  const { data } = await axios.post('/api/auth/login', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function fetchDashboardOutput() {
  const { data } = await api.get('/output/dashboard');
  return data;
}

export async function fetchRecords() {
  const { data } = await api.get('/data/records');
  return data;
}

export async function createRecord(body) {
  const { data } = await api.post('/data/records', body);
  return data;
}

export async function fetchLogs() {
  const { data } = await api.get('/data/logs');
  return data;
}

export default api;
