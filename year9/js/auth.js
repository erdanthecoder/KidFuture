// Sign in with a FlexiHub account. FlexiHub, LearnKyrgyz and the copilot apps share one account
// system (Supabase project "LearnKyrgyz"), so the same email and password work here.
// Google works through Firebase (project learnkyrgyz-c999c) and the auth-bridge function, exactly
// like the copilot apps. Year 9 progress is saved to the account in the app_data table (app = 'year9'),
// so it follows the student between devices.

export const SUPABASE_URL = 'https://lzamxwqxnzcrazyuipjx.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_zSvDRXqxLlW1tuaoJ06PUw_Tges-7OG'; // publishable key: safe to ship, data is protected by row-level security
const FIREBASE = {
  apiKey: 'AIzaSyDiK3P0AkEp1DbXQDI7oH9G536PJCDQdEQ',
  appId: '1:669300688938:web:86c44a103e916282a99b53',
  authDomain: 'learnkyrgyz-c999c.firebaseapp.com',
  messagingSenderId: '669300688938',
  projectId: 'learnkyrgyz-c999c',
  storageBucket: 'learnkyrgyz-c999c.firebasestorage.app',
};
const KEY = 'y9.user';

let client = null;
async function sb() {
  if (client) return client;
  if (!window.supabase) throw new Error('Could not load the sign-in service. Check your internet connection.');
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

const toUser = (u) => ({
  uid: u.id,
  name: u.user_metadata?.full_name || (u.email || 'Student').split('@')[0],
  email: u.email || '',
  photo: u.user_metadata?.avatar_url || '',
  account: true,
});

function remember(user) {
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* private mode */ }
  return user;
}

export function currentUser() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

function friendly(e) {
  const m = String(e?.message || e || '');
  if (/invalid login credentials/i.test(m)) return 'Wrong email or password. Use the same ones as FlexiHub.';
  if (/email not confirmed/i.test(m)) return 'This email has not been confirmed yet.';
  if (/unauthorized-domain/i.test(m)) return 'Google sign-in is not switched on for this address yet. Use your FlexiHub email and password.';
  if (/network|fetch/i.test(m)) return 'No internet connection. Try again, or continue as a guest.';
  return m || 'Sign-in failed. Please try again.';
}

export async function signInWithEmail(email, password) {
  try {
    const c = await sb();
    const { data, error } = await c.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    return remember(toUser(data.user));
  } catch (e) { throw new Error(friendly(e)); }
}

export async function createAccount(name, email, password) {
  try {
    const c = await sb();
    const { data, error } = await c.functions.invoke('auth-bridge', { body: { action: 'signup', email: email.trim(), password, full_name: name.trim(), role: 'student', learn_from: 'en' } });
    if (error) { let msg = error.message; try { msg = (await error.context.json()).error || msg; } catch { /* keep message */ } throw new Error(msg); }
    if (data?.error) throw new Error(data.error);
    return signInWithEmail(email, password);
  } catch (e) { throw new Error(friendly(e)); }
}

export async function signInWithGoogle() {
  try {
    const fb = await import(new URL('vendor/firebase-auth.js', document.baseURI).href);
    const app = fb.initializeApp(FIREBASE, 'year9topics');
    const auth = fb.getAuth(app);
    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await fb.signInWithPopup(auth, provider, fb.browserPopupRedirectResolver);
    const idToken = await cred.user.getIdToken();
    await fb.signOut(auth).catch(() => {});
    const c = await sb();
    const { data, error } = await c.functions.invoke('auth-bridge', { body: { action: 'firebase', idToken, role: 'student', learn_from: 'en' } });
    if (error || !data?.access_token) throw new Error(data?.error || error?.message || 'Google sign-in failed');
    const res = await c.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
    if (res.error) throw res.error;
    return remember(toUser(res.data.user));
  } catch (e) {
    if (/popup-closed|cancelled-popup/i.test(String(e?.code || e?.message))) throw Object.assign(new Error('cancelled'), { cancelled: true });
    throw new Error(friendly(e));
  }
}

export function continueAsGuest(name) {
  return remember({ uid: 'guest', name: (name || '').trim() || 'Guest', email: '', photo: '', account: false });
}

export async function signOutUser() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  try { if (window.supabase) await (await sb()).auth.signOut(); } catch { /* offline */ }
}

// ---------------- progress saved to the account
export async function loadCloud() {
  try {
    const c = await sb();
    const { data, error } = await c.from('app_data').select('data, updated_at').eq('app', 'year9').eq('key', 'progress').maybeSingle();
    if (error) throw error;
    return data?.data || null;
  } catch { return null; }
}

let saveTimer = 0, pending = null;
export function saveCloud(progress) {
  pending = progress;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const body = pending; pending = null;
    try {
      const c = await sb();
      const { data: s } = await c.auth.getSession();
      if (!s?.session) return;
      await c.from('app_data').upsert({ app: 'year9', key: 'progress', data: body, updated_at: new Date().toISOString() }, { onConflict: 'user_id,app,key' });
    } catch { /* offline: the local copy is kept and saved next time */ }
  }, 2500);
}
