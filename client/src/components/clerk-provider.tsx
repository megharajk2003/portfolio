import { AuthProvider } from "@/hooks/useAuth";

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

export default function AuthProviderWrapper({
  children,
}: AuthProviderWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
