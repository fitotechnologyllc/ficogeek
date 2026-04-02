"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isPro: boolean;
  isOwner: boolean;
  isInternal: boolean;
  isAdminOrOwner: boolean;
  mfaEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isPro: false,
  isOwner: false,
  isInternal: false,
  isAdminOrOwner: false,
  mfaEnabled: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check for Redirect Result (if any)
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("[AuthContext] Redirect login result captured:", result.user.uid);
      }
    }).catch(err => {
      console.error("[AuthContext] Redirect result error:", err);
    });

    // 2. Listen for Auth State Changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AuthContext] Auth state changed:", firebaseUser ? `USER: ${firebaseUser.uid}` : "NO_USER");
      
      if (firebaseUser) {
        try {
          const docRef = doc(db, "profiles", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("[AuthContext] Profile loaded:", data.role);
            setProfile(data);
            setUser(firebaseUser);
          } else {
            console.warn("[AuthContext] Profile missing for user:", firebaseUser.uid);
            
            // For Google users, allow a brief delay for backend bootstrapping
            if (firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
              console.log("[AuthContext] Retrying profile fetch for Google user...");
              const retrySnap = await getDoc(docRef);
              if (retrySnap.exists()) {
                setProfile(retrySnap.data());
              } else {
                setProfile(null);
              }
            } else {
              setProfile(null);
            }
            setUser(firebaseUser);
          }
        } catch (err) {
          console.error("[AuthContext] Profile fetch error:", err);
          setProfile(null);
          setUser(firebaseUser);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => {
    const isAdmin = profile?.role === "admin";
    const isPro = profile?.role === "pro";
    const isOwner = profile?.role === "owner";
    const isInternal = profile?.accountType === "internal" || isOwner;
    const isAdminOrOwner = isAdmin || isOwner;
    const mfaEnabled = !!((user as any)?.multiFactor?.enrolledFactors?.length > 0 || profile?.mfaEnabled);

    return {
      user,
      profile,
      loading,
      isAdmin,
      isPro,
      isOwner,
      isInternal,
      isAdminOrOwner,
      mfaEnabled
    };
  }, [user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
