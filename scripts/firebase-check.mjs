import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_APP_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing Firebase variables: ${missing.join(', ')}`);
  process.exit(1);
}

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  await getAuth(app).listUsers(1);
  console.log(`Firebase Admin connection verified for ${process.env.FIREBASE_PROJECT_ID}.`);
  console.log(`Client OAuth origin: http://localhost:${process.env.PORT || 3000}`);
} catch (error) {
  console.error(`Firebase Admin check failed: ${error.message}`);
  process.exit(1);
}
