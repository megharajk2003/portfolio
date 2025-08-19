import { useClerk } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Clear all cached data
      queryClient.clear();

      // Clear local storage
      localStorage.clear();

      // Sign out from Clerk
      await signOut();

      // Force redirect to landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { handleLogout };
}
