import { useAuth } from "@/hooks/useAuth";

export const useAuthStatus = () => {
  const { user, isLoading } = useAuth();

  return {
    isSignedIn: !!user,
    isLoaded: !isLoading,
    userId: user?.id,
    user,
  };
};

export const useAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};
