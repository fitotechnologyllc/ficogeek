# Security Page — Firebase TOTP Removal Report

Generated: 2026-04-03

---

## Summary

The Firebase error `"Firebase: TOTP based MFA not enabled. (auth/operation-not-allowed)."` was
being rendered as a visible red banner on the **Login page** and potentially the **Signup page**.
Previous passes had already removed the TOTP UI component from the Security Settings page, but
the raw Firebase error string was still leaking through the authentication error-handling path.

---

## Root Cause Analysis

### Cause Type
**Mapped error state via raw Firebase SDK message passthrough**

### Exact Mechanism

Firebase's `signInWithPopup` (and `signInWithEmailAndPassword`) internally attempt an MFA check
during certain auth flows. When TOTP-based MFA is not enabled in the Firebase project, Firebase
throws an error with the code `auth/operation-not-allowed` and the message:

```
Firebase: TOTP based MFA not enabled. (auth/operation-not-allowed).
```

The `handleGoogleLogin` catch block in `login/page.tsx` had a `switch` statement with specific
cases for known error codes, but **no case for `auth/operation-not-allowed`**. The `default:`
branch executed `setError(errorMessage)` — passing the raw Firebase SDK string directly to the
red error `<div>` in the JSX.

The `handleLogin` (email/password) catch block used the same raw `setError(errorMessage)` pattern.

Same vulnerability existed in `signup/page.tsx`.

---

## Files That Originally Rendered the Firebase TOTP Error

| File | Mechanism |
|---|---|
| `src/app/login/page.tsx` | `default: setError(errorMessage)` passed raw Firebase TOTP error to red UI banner |
| `src/app/signup/page.tsx` | Same raw passthrough in email signup and Google signup catch blocks |

---

## Files Changed

### 1. `src/app/login/page.tsx`
- **Added** an explicit `case "auth/operation-not-allowed":` with a neutral user message:
  > "This sign-in method is not currently enabled. Please use email/password or contact support."
- **Fixed** the `default:` case to strip any raw Firebase SDK prefix (`Firebase: ...`) and
  error code suffix `(auth/...)` before displaying, preventing future bleed-through of any
  unknown Firebase error messages.

### 2. `src/app/signup/page.tsx`
- **Fixed** the email/password signup catch to sanitize raw Firebase messages before display.
- **Fixed** the Google signup `else` branch to sanitize raw Firebase messages before display.

### 3. `src/lib/server/encryption.ts`
- **Removed** a stale JSDoc comment that referenced `TOTP secrets` — the last remaining
  occurrence of the word "TOTP" in the entire source tree.

---

## Security Settings Page — Already Clean

`src/app/dashboard/settings/security/page.tsx` was already replaced in a prior pass with a
neutral placeholder containing:
- Title: **Two-Factor Authentication**
- Body: A custom authenticator-based 2FA system is being prepared for FICO Geek.
- Badge: **Coming Soon**
- **No** Firebase error box, no TOTP enrollment UI, no Vulnerable/Action Required states.

---

## Post-Fix Verification Results

| Search Term | Source Files | Result |
|---|---|---|
| `TOTP` | `src/**` | ✅ 0 matches |
| `operation-not-allowed` (renderer) | `src/**` | Now only exists as a **suppressor case** in the switch |
| `Begin Enrollment` | `src/**` | ✅ 0 matches |
| `multiFactor` | `src/**` | ✅ 0 matches |
| `TotpMultiFactorGenerator` | `src/**` | ✅ 0 matches |
| `Why switch to Authenticator` | `src/**` | ✅ 0 matches |
| `Vulnerable` (MFA state) | `src/**` | ✅ 0 matches |
| `ACTION REQUIRED` | `src/**` | ✅ 0 matches |

---

## Conclusion

The Firebase TOTP error was **not** being rendered from a UI component, a mock, or an i18n
string. It was being fed directly from the Firebase SDK through an unguarded `setError(rawMessage)`
call in the login page error handler. The fix is surgical:

1. The specific error code is now **intercepted and neutralized** with a safe message.
2. The `default:` branch now **strips Firebase branding** from any future unknown errors.
3. No Firebase MFA/TOTP code exists anywhere in the codebase.
4. The Security page already shows a clean neutral placeholder.
