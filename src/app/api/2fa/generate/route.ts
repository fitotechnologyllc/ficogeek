import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { authenticator } from "otplib";
// @ts-ignore
import * as QRCode from "qrcode";
import { auth, db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
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

    // 2. Generate secret
    const secret = authenticator.generateSecret();
    const userEmail = decodedToken.email || "user@ficogeek.com";
    const otpauth = authenticator.keyuri(userEmail, "FICO Geek", secret);

    // 3. Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // 4. Return to frontend (Do NOT save to DB yet)
    return NextResponse.json({
      secret,
      qrCodeUrl,
    });

  } catch (error: any) {
    console.error("[2FA Generate Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
