"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthContext] Auth state changed:", user ? `USER: ${user.uid}` : "NO_USER");
      setUser(user);
      
      if (user) {
        try {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             const data = docSnap.data();
             console.log("[AuthContext] Profile load success:", data.role);
             setProfile(data);
          } else {
             console.warn("[AuthContext] No profile found for authenticated user.");
             setProfile(null);
          }
        } catch (err) {
          console.error("[AuthContext] Profile fetch failed:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin";
  const isPro = profile?.role === "pro";
  const isOwner = profile?.role === "owner";
  const isInternal = profile?.accountType === "internal" || isOwner;
  const isAdminOrOwner = isAdmin || isOwner;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      isPro, 
      isOwner, 
      isInternal, 
      isAdminOrOwner 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
