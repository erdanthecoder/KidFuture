// "Continue with Google" through Firebase Authentication, the same way the copilot (LearnKyrgyz)
// apps do it. Works on the Firebase-hosted site (year9topics.web.app), which serves the
// project's config at /__/firebase/init.json. School Google Workspace accounts work too.
// Progress is saved per account on this device.

const KEY = 'y9.user';

let configPromise = null;
function firebaseConfig() {
  if (!configPromise) {
    configPromise = fetch('/__/firebase/init.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => (c && c.apiKey ? c : null))
      .catch(() => null);
  }
  return configPromise;
}

export async function googleAvailable() { return !!(await firebaseConfig()); }

export function currentUser() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

function remember(user) {
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* private mode: stays signed in for this visit */ }
  return user;
}

export async function signInWithGoogle() {
  const cfg = await firebaseConfig();
  if (!cfg) throw new Error('Google sign-in works on year9topics.web.app.');
  const fb = await import(new URL('../vendor/firebase-auth.js', import.meta.url).href);
  const app = fb.initializeApp(cfg, 'year9topics');
  const auth = fb.getAuth(app);
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await fb.signInWithPopup(auth, provider, fb.browserPopupRedirectResolver);
  const u = cred.user;
  await fb.signOut(auth).catch(() => {});
  return remember({ uid: u.uid, name: u.displayName || u.email || 'Student', email: u.email || '', photo: u.photoURL || '', google: true });
}

export function continueAsGuest(name) {
  return remember({ uid: 'guest', name: (name || '').trim() || 'Guest', email: '', photo: '', google: false });
}

export function signOutUser() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
