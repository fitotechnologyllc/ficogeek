# FICO Geek - Security Architecture & Hardening Notes

This document summarizes the security posture of the FICO Geek platform following the 2026 Production Hardening Pass.

## 🛡️ Defense-in-Depth Model

FICO Geek employs a multi-layered security strategy:
1.  **Identity**: Firebase Auth for secure user authentication.
2.  **Access Control**: Strict, helper-based Firestore & Storage security rules (Least-Privilege).
3.  **Validation**: Zod schema enforcement for all client-side writes.
4.  **Secure Compute**: Next.js Server Actions for sensitive financial and cross-record transactions.
5.  **Audit Integrity**: Immutable ledger of all security-sensitive events.

## 👮 Role-Based Access Control (RBAC)

| Role | Access Boundaries |
| :--- | :--- |
| **Personal** | Own disputes, documents, letters, and account settings only. |
| **Pro** | Own business settings + assigned clients and their respective files. |
| **Admin** | Platform metadata, moderation tools, and global audit oversight. Restricted from broad content reading of private documents. |
| **Partner** | Own affiliate metrics, referrals, and commission records only. |

## 📦 Data Ownership & Isolation

### Firestore Strategy
*   **Profiles**: Roles and status are immutable from the client. Elevation is only possible through Admin or Server Action.
*   **Disputes/Letters**: Every record is pinned to an `ownerUID` (Personal) or `proUID` (Professional). Rules verify this relationship on every request.
*   **Financials**: Commissions and Payouts are updated exclusively via Server Actions using the Firebase Admin SDK.

### Storage Strategy
*   **Namespace Pathing**: Files are stored in strictly isolated paths:
    *   `documents/{uid}/...` (Personal)
    *   `letters/{uid}/...` (Letters)
    *   `pros/{proUID}/clients/{clientId}/...` (Pro-Client)
*   **Content Filtering**: Only `application/pdf` and `image/*` are permitted.
*   **Quotas**: Strict file size limits (5MB - 15MB) per operation.

## 🕰️ Audit Integrity

Strategic events are logged to the `audit_logs` collection:
*   **Signups/Logins**: Tracked with non-spoofable UID and secure actor metadata.
*   **Sensitive Mutations**: Plan upgrades, role changes, and record deletions generate immutable entries.
*   **Timestamp Locking**: Firestore rules enforce that log timestamps exactly match the server execution time (`request.time`).

## ⚙️ Configuration & Secrets

### Required Environment Variables
To enable the secure Server Action layer, the following Must be configured in your production environment:
*   `FIREBASE_PROJECT_ID`
*   `FIREBASE_CLIENT_EMAIL`
*   `FIREBASE_PRIVATE_KEY` (formatted with `\n` for multi-line support)

---
*FICO Geek Security Hardening v1.0.0*
