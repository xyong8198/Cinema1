"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from "@/types/user";

interface ProtectedProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function Protected({
  children,
  requireAdmin = false,
}: ProtectedProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requireAdmin && user?.role !== Role.ADMIN) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, requireAdmin, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && user?.role !== Role.ADMIN) {
    return null;
  }

  return <>{children}</>;
}
