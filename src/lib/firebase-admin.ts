import * as admin from "firebase-admin";

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVER_PRIVATE_KEY && process.env.FIREBASE_SERVER_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVER_CLIENT_EMAIL,
        // Replace \\n with \n in the private key
        privateKey: process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Fallback to application default credentials for Firebase App Hosting / Cloud Run
    // This prevents 503 errors when the env file is missing in the production container
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
