import { useAuth, useUser } from "@clerk/clerk-react";

export const useClerkAuth = () => {
  const { isSignedIn, isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();

  return {
    isSignedIn,
    isLoaded,
    userId,
    user,
    getToken,
  };
};

export const useAuthHeaders = async () => {
  const { getToken } = useAuth();
  const token = await getToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
