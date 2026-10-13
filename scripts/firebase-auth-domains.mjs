// Adds year9topics.web.app to Firebase Authentication's authorized domains so
// "Continue with Google" works there. Uses the key in GOOGLE_APPLICATION_CREDENTIALS.
import { GoogleAuth } from 'google-auth-library';

const project = process.argv[2];
const wanted = ['year9topics.web.app', 'year9topics.firebaseapp.com'];
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = await auth.getClient();
const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`;
try {
  const { data } = await client.request({ url });
  const current = data.authorizedDomains || [];
  const merged = [...new Set([...current, ...wanted])];
  if (merged.length === current.length) { console.log('Authorized domains already set'); process.exit(0); }
  await client.request({ url: `${url}?updateMask=authorizedDomains`, method: 'PATCH', data: { authorizedDomains: merged } });
  console.log('Authorized domains now:', merged.join(', '));
} catch (e) {
  console.log('::warning::Could not update authorized domains —', e.response?.data?.error?.message || e.message,
    '\nEnable Authentication → Google in the Firebase console, then re-run this workflow.');
}
