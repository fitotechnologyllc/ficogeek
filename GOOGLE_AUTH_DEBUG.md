# Google Auth Debug & Setup Guide

This document describes the hardened Google Sign-In flow for FICO Geek and the manual steps required in the Firebase Console to ensure production stability.

## 1. Implementation Details

- **Entry Point**: `src/app/login/page.tsx`
- **Method**: `signInWithPopup` (Primary for Desktop).
- **Profile Bootstrap**: `src/lib/auth-utils.ts` -> `ensureUserProfile`.
- **Session Sync**: `src/context/AuthContext.tsx` captures redirect results and manages the Firestore profile state.

### How Bootstrap Works
1. User logs in via Google Popup.
2. Firebase returns a User object.
3. `ensureUserProfile` is called immediately.
4. If a document in `profiles/{uid}` is missing:
   - It is created with `{ role: 'personal', status: 'Active' }`.
   - Google `displayName` is mapped to `name`.
5. If the document exists:
   - It is fetched but **not** overwritten (to preserve custom roles like `admin`).
   - `setDoc(..., { merge: true })` ensures safety.

## 2. Required Firebase Console Settings

To prevent "Application error" or "Unauthorized Domain", ensure the following is configured in your [Firebase Console](https://console.firebase.google.com/):

### Authentication -> Settings -> Authorized Domains
Add your production and staging domains to the list. Without these, Google Auth will fail with an `auth/unauthorized-domain` error.
- `localhost`
- `fico-geek.web.app` (Example)
- `fico-geek.firebaseapp.com`
- Your custom domain (e.g., `app.ficogeek.com`)

### Authentication -> Sign-in method
1. Enable **Google** in the "Additional providers" list.
2. Ensure the "Project support email" is selected.

### Firestore Database -> Rules
Ensure that the `profiles` collection allows users to read their own document and allows the system to create them during signup.

## 3. Common Error Codes & Fixes

| Error Code | Meaning | Fix |
| :--- | :--- | :--- |
| `auth/popup-blocked` | The browser blocked the login window. | Enable popups in the browser address bar. |
| `auth/unauthorized-domain` | Domain is missing from Firebase Settings. | Add the current URL to "Authorized Domains" in Firebase. |
| `auth/cancelled-by-user` | User closed the popup before finishing. | Simply click login and try again. |
| `auth/internal-error` | Firebase backend or network issue. | Wait a moment or check your internet connection. |

## 4. Diagnostics
Open the browser console (F12) to see detailed logs prefixed with:
- `[GoogleAuth]` - Login page specific actions.
- `[Bootstrap]` - Profile creation logic.
- `[AuthContext]` - Overall session management.
