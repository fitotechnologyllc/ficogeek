import * as admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK safely for both runtime and build time.
 */
function getAdminApp() {
  const APP_NAME = "FICO_GEEK_SERVER";
  
  // 1. Return existing if initialized
  const existingApp = admin.apps.find(a => a?.name === APP_NAME);
  if (existingApp) return existingApp;

  // 2. Try the default app as a secondary fallback
  if (admin.apps.length > 0 && !existingApp) {
    const defaultApp = admin.apps.find(a => a?.name === '[DEFAULT]');
    if (defaultApp) return defaultApp;
  }

  const privateKey = process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_SERVER_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // 3. Handle missing credentials gracefully (especially during build)
  if (!privateKey || !clientEmail || !projectId) {
    if (projectId) {
      try {
        return admin.initializeApp({ projectId }, APP_NAME);
      } catch (e) {
        console.warn("[FirebaseAdmin] Fallback init failed or already exists.");
      }
    }
    return admin.apps[0] || null as unknown as admin.app.App;
  }

  // 4. Final Initialization
  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, APP_NAME);
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      return admin.app(APP_NAME);
    }
    console.error("[FirebaseAdmin] Critical Initialization Error:", error.message);
    return admin.apps[0] || null as unknown as admin.app.App;
  }
}

// Initialize once
const app = getAdminApp();

export const db = app ? admin.firestore(app) : (null as unknown as admin.firestore.Firestore);
export const auth = app ? admin.auth(app) : (null as unknown as admin.auth.Auth);
