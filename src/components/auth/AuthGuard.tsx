"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login"); // ✅ fixed
      return;
    }
    if (user && !user.isProfileComplete) {
      router.replace("/complete-profile");
    }
  }, [token, user, router]);

  if (!token) return null;

  return <>{children}</>;
}