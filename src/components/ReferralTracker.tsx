"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, limit } from "firebase/firestore";

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref");
  const couponId = searchParams.get("coupon");

  useEffect(() => {
    const trackReferral = async () => {
      // 1. Handle Referrer UID Case (ref=partnerUID)
      if (refId) {
        sessionStorage.setItem("fico_geek_ref", refId);
        
        try {
           // Basic click tracking in background
           await addDoc(collection(db, "referral_clicks"), {
             referralId: refId,
             timestamp: new Date().toISOString(),
             userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
             page: window.location.pathname
           });
        } catch (e) {
           console.error("Failed to track click", e);
        }
      }

      // 2. Handle Coupon Code Case (coupon=FICOGEEK10)
      if (couponId) {
        sessionStorage.setItem("fico_geek_coupon", couponId);
      }
    };

    trackReferral();
  }, [refId, couponId]);

  return null; // Invisible component
}
