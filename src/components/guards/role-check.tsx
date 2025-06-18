"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useCheckRole } from "@/hooks/use-check-role";

// Component to check the user's role and redirect them to the appropriate page
export function RoleCheck() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth(); // Get authentication status and loading state
  const { data: role, isLoading: isRoleLoading } = useCheckRole(); // Fetch the user's role and loading state

  useEffect(() => {
    // Redirect the user based on their role once authentication and role data are loaded
    if (!isAuthLoading && !isRoleLoading && isAuthenticated) {
      switch (role) {
        case "teacher":
          router.push("/teacher"); // Redirect to admin dashboard
          break;
        case "student":
          router.push("/student"); // Redirect to teacher dashboard
          break;
        default:
          router.push("/"); // Redirect to the default page if no role matches
      }
    }
  }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router]); // Dependencies for the effect

  return null; // This component does not render any UI
}
