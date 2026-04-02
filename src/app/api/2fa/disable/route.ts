import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { authenticator } from "otplib";
import { auth, db } from "@/lib/firebase-admin";
import { decrypt } from "@/lib/server/encryption";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing verification code" }, { status: 400 });
    }

    // 1. Verify session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch encrypted secret from Firestore
    const userDoc = await db.collection("profiles").doc(uid).get();
    const userData = userDoc.data();
    
    if (!userDoc.exists || !userData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { twoFactorSecretEncrypted } = userData;

    if (!twoFactorSecretEncrypted) {
      return NextResponse.json({ error: "2FA is not set up for this account." }, { status: 400 });
    }

    // 3. Decrypt and verify
    const secret = decrypt(twoFactorSecretEncrypted);
    const isValid = authenticator.check(token, secret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code. 2FA cannot be disabled without a valid code." }, { status: 400 });
    }

    // 4. Disable 2FA
    await db.collection("profiles").doc(uid).update({
      twoFactorEnabled: false,
      // We keep the secret for recovery purposes but disabled, 
      // or we can remove it for ultimate privacy. Removing it is cleaner.
      twoFactorSecretEncrypted: admin.firestore.FieldValue.delete(),
      twoFactorEnrolledAt: admin.firestore.FieldValue.delete(),
    });

    // 5. Audit log
    await db.collection("audit_logs").add({
      action: "2FA_DISABLED",
      actorUID: uid,
      timestamp: new Date().toISOString(),
      details: "User self-disabled TOTP 2FA after verification.",
      severity: "critical"
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[2FA Disable Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to access admin sdk for FieldValue
import * as admin from "firebase-admin";
