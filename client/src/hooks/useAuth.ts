import { useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { user, isLoaded } = useUser();

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: !!user && isLoaded,
  };
}