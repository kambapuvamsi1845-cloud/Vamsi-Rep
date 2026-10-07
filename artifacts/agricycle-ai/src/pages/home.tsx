import { ArrowDownRight, ArrowRight, Check, CircleDot, Leaf, ShieldCheck, Sprout, Users } from 'lucide-react';
import { Link } from 'wouter';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { getHealthCheckQueryKey, useHealthCheck } from '@workspace/api-client-react';
import { useAuth, dashboardForRole } from '@/lib/auth';

export default function Home() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), retry: false, staleTime: 30_000 } });
  const { user } = useAuth();
  return (
    <main className="grain min-h-[100dvh] overflow-hidden bg-background">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="rounded-lg" data-testid="link-home-brand"><Brand /></Link>
        <nav className="flex items-center gap-2">
          <Link href={user ? dashboardForRole(user.role) : '/login'} className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground/75 transition hover:text-primary sm:block" data-testid="link-sign-in">{user ? 'Your workspace' : 'Sign in'}</Link>
          <Button asChild className="rounded-xl px-5"><Link href={user ? dashboardForRole(user.role) : '/register'} data-testid="link-get-started">{user ? 'Open workspace' : 'Get started'}<ArrowRight size={16} /></Link></Button>
        </nav>
      </header>
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-12 md:min-h-[640px] md:grid-cols-[1.05fr_.95fr] md:gap-8 md:px-10 md:pb-20 md:pt-8">
        <div className="reveal relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-xs font-bold uppercase tracking-[.15em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Agriculture, in good company
          </div>
          <h1 className="font-serif text-[clamp(3.6rem,8vw,6.4rem)] font-extrabold leading-[.99] tracking-[-.075em] text-foreground">
            A better way<br />to <span className="relative inline-block text-primary">grow forward.<span className="absolute -bottom-1 left-0 h-[7px] w-full rounded-full bg-accent/80" /></span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
            AgriCycle brings the people behind good food into one shared place—supporting farmers and connecting consumers to a more thoughtful food system.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl px-6 text-sm"><Link href="/register" data-testid="link-create-account">Create your account<ArrowRight size={17} /></Link></Button>
            <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-secondary" data-testid="link-existing-account">I already have an account<ArrowDownRight size={16} /></Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck size={18} className="text-primary" /> Role-based access. Private by design.
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] md:justify-self-end">
          <div className="absolute -right-10 top-12 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative aspect-[.95] overflow-hidden rounded-[2rem] border border-[#d7d4c7] bg-[#dce4d1] shadow-[0_30px_80px_-28px_rgba(29,53,38,.35)]">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(222,230,208,.2),rgba(25,61,41,.2))]" />
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(ellipse at 72% 22%, #f0e8c7 0 7%, transparent 7.4%), linear-gradient(165deg,transparent 0 34%,#a2b18d 34.3% 51%,#647f5d 51.3% 68%,#375d47 68.3% 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 h-[55%] overflow-hidden">
              {[0,1,2,3,4].map((row) => <div key={row} className="absolute -left-[18%] h-[34%] w-[140%] rounded-[50%] border-t-[2px] border-[#e3d6ae]/65" style={{ top: `${row * 16}%`, transform: `rotate(${-12 + row * 2}deg)` }} />)}
              <div className="absolute inset-0 bg-[linear-gradient(175deg,transparent,rgba(23,54,38,.25))]" />
            </div>
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/50 bg-[#faf9ef]/85 px-3 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#34523d] shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" /> From field to table
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/45 bg-[#f8f5e9]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">The shared cycle</p><p className="mt-1.5 font-serif text-2xl font-bold tracking-[-.04em]">Made to move together.</p></div>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sprout size={19} /></span>
              </div>
              <div className="mt-5 flex items-center gap-2">
                {['Grow', 'Connect', 'Renew'].map((item, index) => <div className="flex flex-1 items-center gap-2" key={item}><span className="grid size-7 place-items-center rounded-full bg-[#dfe7d9] text-primary">{index === 0 ? <Sprout size={14} /> : index === 1 ? <Users size={14} /> : <Leaf size={14} />}</span><span className="text-[11px] font-semibold text-[#526253]">{item}</span>{index < 2 && <span className="h-px flex-1 bg-[#bdc9b9]" />}</div>)}
              </div>
            </div>
          </div>
          <div className="absolute -right-3 top-[44%] hidden -rotate-3 rounded-2xl border border-[#e5dfcc] bg-[#fbf8ee] p-3.5 shadow-lg sm:block">
            <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-full bg-[#e6eddc] text-primary"><CircleDot size={16} /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">One connected system</p><p className="mt-0.5 text-sm font-bold">People. Produce. Possibility.</p></div></div>
          </div>
        </div>
      </section>
      <section className="border-y border-[#e2dfd4] bg-[#efede3]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[.8fr_1.2fr] md:items-center md:px-10">
          <p className="max-w-sm font-serif text-2xl font-bold leading-tight tracking-[-.04em]">A platform for the whole food journey—not just one part of it.</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {[['01','For farmers','A place to take part in a more connected agricultural lifecycle.'],['02','For consumers','A clearer connection to the people and practices behind food.'],['03','For administrators','A secure foundation for the platform’s stewardship.']].map(([n,title,copy]) => <article key={n} className="border-l border-[#d4d0c2] pl-4"><p className="text-xs font-bold tracking-[.12em] text-primary">{n} /</p><h3 className="mt-1 font-bold">{title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{copy}</p></article>)}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Built around people</p><h2 className="mt-4 max-w-md font-serif text-4xl font-extrabold leading-[1.08] tracking-[-.06em]">Good agriculture is a relationship.</h2></div>
        <div className="space-y-7">
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">The work of growing food touches every one of us. AgriCycle AI is being built to help that relationship feel more visible, more supported, and easier to take part in.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5"><span className="grid size-9 place-items-center rounded-xl bg-[#e7eee2] text-primary"><Sprout size={18} /></span><h3 className="mt-4 font-bold">Start with your role</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose farmer or consumer when you join. Your account opens the right space for you.</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><span className="grid size-9 place-items-center rounded-xl bg-[#f3ead7] text-[#9c7530]"><Check size={18} /></span><h3 className="mt-4 font-bold">A solid first step</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">This first phase establishes secure accounts and role-aware access.</p></div>
          </div>
        </div>
      </section>
      <section className="mx-6 mb-20 overflow-hidden rounded-[2rem] bg-[#1e3c2b] text-[#f4f1e5] md:mx-auto md:max-w-7xl">
        <div className="relative grid gap-8 px-7 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-12 md:py-14">
          <div className="absolute -right-12 -top-20 size-72 rounded-full border border-white/10" /><div className="absolute -right-2 -top-10 size-52 rounded-full border border-white/10" />
          <div className="relative"><p className="text-xs font-bold uppercase tracking-[.19em] text-[#d5bd7c]">Your next season starts here</p><h2 className="mt-3 font-serif text-3xl font-extrabold tracking-[-.05em] md:text-4xl">Join the cycle.</h2><p className="mt-3 max-w-lg leading-7 text-[#d3ddcf]">Create a secure account and find your place in a more connected food system.</p></div>
          <Button asChild size="lg" className="relative h-12 rounded-xl bg-[#f3e7c5] px-6 text-[#1e3c2b] hover:bg-[#f8edcf]"><Link href="/register" data-testid="link-join-cycle">Create account<ArrowRight size={17} /></Link></Button>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-border px-6 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
        <Brand /><p>Built for a food system that works together.</p><div className="flex items-center gap-2" data-testid="status-platform-health"><span className={`size-2 rounded-full ${health.data?.status ? 'bg-primary' : health.isError ? 'bg-destructive' : 'bg-accent'}`} />{health.isLoading ? 'Checking platform' : health.isError ? 'Platform status unavailable' : `Platform ${health.data?.status ?? 'available'}`}</div>
      </footer>
    </main>
  );
}
