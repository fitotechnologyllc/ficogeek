import * as admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK safely for both runtime and build time.
 */
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const privateKey = process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_SERVER_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.warn("[FirebaseAdmin] Missing environment variables for certificate auth. Falling back to simple init.");
    // This is often needed for build time or static generation bypass
    if (projectId) {
      return admin.initializeApp({ projectId });
    }
    // Final fallback: try to use default if available, or just log error
    try {
      return admin.app();
    } catch {
      console.error("[FirebaseAdmin] No apps initialized and no projectId provided.");
      return null as unknown as admin.app.App;
    }
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, "SERVER_CONTEXT_" + Date.now()); // Unique name to avoid race conditions in some SSR environments
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[FirebaseAdmin] Initialization Error:", errorMessage);
    if (admin.apps.length > 0) return admin.apps[0]!;
    return null as unknown as admin.app.App;
  }
}

// Initialize once
const app = getAdminApp();

export const db = app ? admin.firestore(app) : (null as unknown as admin.firestore.Firestore);
export const auth = app ? admin.auth(app) : (null as unknown as admin.auth.Auth);
