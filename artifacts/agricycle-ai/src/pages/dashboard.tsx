import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowUpRight, CircleHelp, LogOut, Menu, ShieldCheck, Sprout, X } from 'lucide-react';
import type { AuthUser } from '@workspace/api-client-react';
import { Brand } from '@/components/brand';
import { useAuth, dashboardForRole } from '@/lib/auth';

const roleCopy: Record<AuthUser['role'], { title: string; description: string; prompt: string; nav: string }> = {
  FARMER: { title: 'Your farming space', description: 'A secure home for your AgriCycle account.', prompt: 'Your farmer workspace is ready for what comes next.', nav: 'Farmer overview' },
  CONSUMER: { title: 'Your consumer space', description: 'A secure home for your AgriCycle account.', prompt: 'Your consumer workspace is ready for what comes next.', nav: 'Consumer overview' },
  ADMIN: { title: 'Platform administration', description: 'A secure home for your AgriCycle account.', prompt: 'Your administrator workspace is ready for what comes next.', nav: 'Administration overview' },
};

export function Dashboard() {
  const { user, logout, isLoggingOut } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  if (!user) return null;
  const content = roleCopy[user.role];
  const initials = user.fullName.trim().split(/\s+/).slice(0, 2).map((name) => name[0]?.toUpperCase()).join('');
  async function signOut() {
    setLogoutError('');
    try { await logout(); setLocation('/login'); } catch { setLogoutError('We could not sign you out. Please try again.'); }
  }
  const sidebar = <div className="flex h-full flex-col px-5 py-6">
    <div className="flex items-center justify-between text-sidebar-foreground"><Brand /><button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-white/10 lg:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X size={19} /></button></div>
    <p className="mt-11 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</p>
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold text-sidebar-foreground" data-testid="status-active-navigation"><span className="grid size-8 place-items-center rounded-lg bg-[#d4e2d0] text-primary"><Sprout size={16} /></span>{content.nav}</div>
    <div className="mt-auto">
      <div className="mb-4 flex gap-3 rounded-xl border border-white/10 p-3" data-testid="card-current-user"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d9e6d3] text-xs font-bold text-primary">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-sidebar-foreground" data-testid="text-user-name">{user.fullName}</p><p className="mt-0.5 truncate text-xs text-sidebar-foreground/55">{user.email}</p></div></div>
      <button type="button" onClick={signOut} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/75 transition hover:bg-white/10 hover:text-sidebar-foreground disabled:opacity-50" data-testid="button-logout"><LogOut size={17} />{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
    </div>
  </div>;
  return <main className="min-h-[100dvh] bg-[#f3f1e8]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-[#1e3c2b] lg:block">{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-[#14291d]/40 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="h-full w-[min(84vw,300px)] bg-[#1e3c2b]" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}
    <div className="lg:pl-[260px]">
      <header className="flex h-[76px] items-center justify-between border-b border-[#dedbce] bg-[#f7f5ed] px-5 sm:px-8">
        <div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-lg border border-border bg-card lg:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={18} /></button><div><p className="text-xs font-semibold text-muted-foreground">AgriCycle AI / {user.role.toLowerCase()}</p><p className="mt-0.5 text-sm font-bold">Overview</p></div></div>
        <div className="flex items-center gap-4"><span className="hidden text-sm text-muted-foreground sm:block">Signed in as <strong className="text-foreground">{user.fullName}</strong></span><button type="button" title="Help information" className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground" data-testid="button-help"><CircleHelp size={17} /></button></div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {logoutError && <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert" data-testid="status-logout-error">{logoutError}</div>}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-bold uppercase tracking-[.17em] text-primary">{user.role} ACCOUNT</p><h1 className="mt-3 font-serif text-4xl font-extrabold tracking-[-.06em] sm:text-5xl" data-testid="heading-dashboard">{content.title}</h1><p className="mt-3 text-muted-foreground">{content.description}</p></div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9dfd1] bg-[#e9eee4] px-3 py-2 text-xs font-semibold text-primary" data-testid="status-secure-session"><ShieldCheck size={15} /> Secure session</div>
        </div>
        <div className="relative overflow-hidden rounded-[1.6rem] border border-[#dfddcf] bg-[#fbfaf5] p-7 sm:p-10">
          <div className="absolute -right-12 -top-24 size-72 rounded-full border border-[#e9e5d6]" /><div className="absolute -right-2 -top-14 size-48 rounded-full border border-[#e9e5d6]" />
          <div className="relative max-w-2xl">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#e4eadc] text-primary"><Sprout size={23} /></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-primary">Foundation phase</p>
            <h2 className="mt-2 font-serif text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">{content.prompt}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">AgriCycle is establishing secure accounts and role-aware access in this phase. Your account is active; farming and consumer workflows will be introduced in a later release.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground"><ShieldCheck size={14} className="text-primary" />Signed in securely</div>
              <button type="button" onClick={() => setLocation('/')} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline" data-testid="button-back-to-site">Visit public site<ArrowUpRight size={14} /></button>
            </div>
          </div>
        </div>
        <footer className="mt-10 flex flex-col gap-3 border-t border-[#dedbce] pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>AgriCycle AI · Account foundation</span><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />Role verified: {user.role.toLowerCase()}</span></footer>
      </section>
    </div>
  </main>;
}
