import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { authenticator } from "otplib";
import { auth, db } from "@/lib/firebase-admin";
import { encrypt } from "@/lib/server/encryption";

export async function POST(req: NextRequest) {
  try {
    const { token, secret } = await req.json();

    if (!token || !secret) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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

    // 2. Validate token
    const isValid = authenticator.check(token, secret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // 3. Encrypt secret
    const encryptedSecret = encrypt(secret);

    // 4. Update Firestore Profile
    await db.collection("profiles").doc(uid).update({
      twoFactorEnabled: true,
      twoFactorSecretEncrypted: encryptedSecret,
      twoFactorMethod: "totp",
      twoFactorEnrolledAt: new Date().toISOString(),
    });

    // 5. Add audit log
    await db.collection("audit_logs").add({
      action: "2FA_ENROLLED",
      actorUID: uid,
      timestamp: new Date().toISOString(),
      details: "TOTP based multi-factor authentication was enabled.",
      severity: "high"
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[2FA Verify Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
