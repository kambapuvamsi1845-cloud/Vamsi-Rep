import { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogout } from '@workspace/api-client-react';
import type { AuthSession, AuthUser } from '@workspace/api-client-react';

type AuthValue = {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false, staleTime: 0 }, request: { credentials: 'include' } });
  const logoutMutation = useLogout({ request: { credentials: 'include' } });
  async function logout() {
    await logoutMutation.mutateAsync();
    await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    queryClient.setQueryData<AuthSession | null>(getGetCurrentUserQueryKey(), null);
  }
  return <AuthContext.Provider value={{
    user: session.data?.user ?? null,
    isLoading: session.isLoading,
    isLoggingOut: logoutMutation.isPending,
    logout,
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

export function dashboardForRole(role: AuthUser['role']) {
  return `/${role.toLowerCase()}/dashboard`;
}

export function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
