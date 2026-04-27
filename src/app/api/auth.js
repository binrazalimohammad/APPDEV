import { API_BASE_URL } from './config';

const options = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};


export async function authLogin({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    ...options,
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (response.ok) { 
    return { token: data.token, user: data.user ?? null };
  }
  throw new Error(data.message || data.detail || 'Login failed');
}
