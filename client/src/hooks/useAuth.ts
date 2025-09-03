import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Extract user from the response structure { user: {...}, profile: {...} }
  const user = (authData as any)?.user;
  const profile = (authData as any)?.profile;

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
  };
}
