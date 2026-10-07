import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, dashboardForRole, useAuth } from '@/lib/auth';
import { Dashboard } from '@/pages/dashboard';
import Home from '@/pages/home';
import { LoginPage, RegisterPage } from '@/pages/auth-pages';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

function LoadingScreen({ label = 'Checking your secure session' }: { label?: string }) {
  return <main className="grid min-h-[100dvh] place-items-center bg-background px-6">
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm" role="status" data-testid="status-session-loading">
      <div className="flex items-center gap-3"><span className="size-10 animate-pulse rounded-xl bg-[#e3eadc]" /><div className="flex-1 space-y-2"><div className="h-3 w-32 animate-pulse rounded bg-muted" /><div className="h-2.5 w-48 animate-pulse rounded bg-muted" /></div></div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}…</p>
    </div>
  </main>;
}

function PublicAuthRedirect({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (user) setLocation(dashboardForRole(user.role));
  }, [user, setLocation]);
  if (isLoading || user) return <LoadingScreen label={user ? 'Opening your workspace' : undefined} />;
  return <>{children}</>;
}

function ProtectedDashboard({ role }: { role: 'FARMER' | 'CONSUMER' | 'ADMIN' }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading) {
      if (!user) setLocation('/login');
      else if (user.role !== role) setLocation(dashboardForRole(user.role));
    }
  }, [isLoading, user, role, setLocation]);
  if (isLoading) return <LoadingScreen />;
  if (!user || user.role !== role) return <LoadingScreen label={user ? 'Taking you to your workspace' : 'Returning to sign in'} />;
  return <Dashboard />;
}

function Router() {
  return <RoutedErrorBoundary><AuthProvider><Switch>
    <Route path="/" component={Home} />
    <Route path="/register">{() => <PublicAuthRedirect><RegisterPage /></PublicAuthRedirect>}</Route>
    <Route path="/login">{() => <PublicAuthRedirect><LoginPage /></PublicAuthRedirect>}</Route>
    <Route path="/farmer/dashboard">{() => <ProtectedDashboard role="FARMER" />}</Route>
    <Route path="/consumer/dashboard">{() => <ProtectedDashboard role="CONSUMER" />}</Route>
    <Route path="/admin/dashboard">{() => <ProtectedDashboard role="ADMIN" />}</Route>
    <Route component={NotFound} />
  </Switch></AuthProvider></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
