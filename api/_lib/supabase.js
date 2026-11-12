// Helper for Supabase REST API calls
// Keys must only be read from process.env to ensure zero secret leakage in git repositories
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export async function supabaseFetch(table, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY) are not configured');
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(`Supabase request failed: ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
