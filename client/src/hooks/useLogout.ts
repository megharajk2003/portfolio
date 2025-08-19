import { useAuth } from "./useAuth";

export function useLogout() {
  const { logoutMutation } = useAuth();

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.clear();

      // Trigger logout mutation
      await logoutMutation.mutateAsync();

      // Force redirect to landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { handleLogout };
}
