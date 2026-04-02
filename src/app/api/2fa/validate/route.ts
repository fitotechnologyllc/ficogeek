import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { authenticator } from "otplib";
import { auth, db } from "@/lib/firebase-admin";
import { decrypt } from "@/lib/server/encryption";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
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

    // 2. Fetch user profile for audit log
    const userDoc = await db.collection("profiles").doc(uid).get();
    const userData = userDoc.data();
    
    if (!userDoc.exists || !userData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { twoFactorEnabled, twoFactorSecretEncrypted } = userData;

    if (!twoFactorEnabled || !twoFactorSecretEncrypted) {
      return NextResponse.json({ error: "Two-Factor authentication is not enabled for this account." }, { status: 400 });
    }

    // 3. Decrypt secret
    const secret = decrypt(twoFactorSecretEncrypted);

    // 4. Validate token
    const isValid = authenticator.check(token, secret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
    }

    // 5. Add audit log
    await db.collection("audit_logs").add({
      actorUID: uid,
      actorName: userData.name || "User",
      actorRole: userData.role || "personal",
      action: "TOTP_VALIDATED",
      summary: "User successfully passed TOTP challenge",
      timestamp: new Date(),
      targetType: "AUTH_SESSION",
      targetId: "SESSION_REVALIDATED"
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[2FA Validate Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
