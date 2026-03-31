"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="pro">
      {children}
    </ProtectedRoute>
  );
}
