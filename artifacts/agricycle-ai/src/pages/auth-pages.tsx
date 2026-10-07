import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, ShieldCheck, Sprout } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey, useLogin, useRegister } from '@workspace/api-client-react';
import type { AuthSession } from '@workspace/api-client-react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { errorMessage, dashboardForRole } from '@/lib/auth';

const passwordSchema = z.string().min(8, 'Use at least 8 characters.').max(128, 'Password must be 128 characters or fewer.');
const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email must be 254 characters or fewer.'),
  password: passwordSchema,
});
const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters.').max(120, 'Name must be 120 characters or fewer.'),
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email must be 254 characters or fewer.'),
  password: passwordSchema,
  role: z.enum(['FARMER', 'CONSUMER']),
});
type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

function AuthFrame({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return <main className="grain min-h-[100dvh] bg-background">
    <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(420px,.92fr)_1.08fr]">
      <section className="relative flex min-h-[310px] flex-col justify-between overflow-hidden bg-[#1e3c2b] px-7 py-7 text-[#f4f1e5] sm:px-10 lg:min-h-[100dvh] lg:px-12 lg:py-10">
        <div className="absolute -right-24 top-24 size-[420px] rounded-full border border-white/10" /><div className="absolute -right-12 top-36 size-[300px] rounded-full border border-white/10" /><div className="absolute -right-2 top-48 size-[180px] rounded-full border border-white/10" />
        <div className="relative flex items-center justify-between"><Link href="/" className="text-white" data-testid="link-auth-brand"><Brand /></Link><Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white lg:hidden" data-testid="link-back-home"><ArrowLeft size={14} /> Home</Link></div>
        <div className="relative my-10 max-w-lg lg:my-auto lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d6bd7c]">AgriCycle AI / {eyebrow}</p>
          <h1 className="mt-5 max-w-[540px] font-serif text-4xl font-extrabold leading-[1.06] tracking-[-.055em] sm:text-5xl">Good food starts with people who care.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#d0dacd]">A shared space for the people who grow, choose, and steward the future of food.</p>
          <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-5">
            <span className="grid size-10 place-items-center rounded-full bg-white/10 text-[#e4d09a]"><ShieldCheck size={19} /></span>
            <div><p className="text-sm font-semibold">Secure by design</p><p className="mt-0.5 text-xs text-white/60">Your account. Your role. Your space.</p></div>
          </div>
        </div>
        <div className="relative hidden items-center justify-between text-xs text-white/55 lg:flex"><span>Growing a stronger cycle, together.</span><span>01 — 03</span></div>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-[440px] reveal">
          <Link href="/" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary" data-testid="link-auth-back"><ArrowLeft size={16} /> Back to AgriCycle</Link>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-[-.06em]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 flex items-start gap-2.5 rounded-xl bg-[#eeede3] px-4 py-3 text-xs leading-5 text-[#627064]"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-primary" />Authentication is handled securely. Your session is protected in an HttpOnly cookie.</div>
        </div>
      </section>
    </div>
  </main>;
}

function MutationAlert({ message }: { message: string }) {
  if (!message) return null;
  return <div role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive" data-testid="status-auth-error">{message}</div>;
}

export function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const mutation = useLogin({ request: { credentials: 'include' } });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFields>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  async function submit(values: LoginFields) {
    setError('');
    try {
      const session = await mutation.mutateAsync({ data: values });
      queryClient.setQueryData<AuthSession>(getGetCurrentUserQueryKey(), session);
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      setLocation(dashboardForRole(session.user.role));
    } catch (e) { setError(errorMessage(e)); }
  }
  return <AuthFrame eyebrow="Welcome back" title="Sign in to your space." subtitle="Use your account email to continue to your AgriCycle workspace.">
    <MutationAlert message={error} />
    <Form {...form}><form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
      <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel className="text-sm font-semibold">Email address</FormLabel><FormControl><div className="relative"><Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" data-testid="input-login-email" className="h-12 rounded-xl border-[#dcd9cd] bg-card pl-10" /></div></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="password" render={({ field }) => <FormItem><div className="flex items-center justify-between"><FormLabel className="text-sm font-semibold">Password</FormLabel><span className="text-xs text-muted-foreground">At least 8 characters</span></div><FormControl><div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" data-testid="input-login-password" className="h-12 rounded-xl border-[#dcd9cd] bg-card pl-10 pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary" data-testid="button-toggle-login-password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></FormControl><FormMessage /></FormItem>} />
      <Button type="submit" disabled={mutation.isPending} className="h-12 w-full rounded-xl text-sm font-bold" data-testid="button-submit-login">{mutation.isPending ? <><span className="size-4 animate-pulse rounded-full bg-primary-foreground/40" />Signing you in…</> : <>Sign in<ArrowRight size={16} /></>}</Button>
    </form></Form>
    <p className="mt-7 text-center text-sm text-muted-foreground">New to AgriCycle? <Link href="/register" className="font-bold text-primary hover:underline" data-testid="link-register-from-login">Create an account</Link></p>
  </AuthFrame>;
}

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const mutation = useRegister({ request: { credentials: 'include' } });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<RegisterFields>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: '', email: '', password: '', role: 'FARMER' } });
  async function submit(values: RegisterFields) {
    setError('');
    try {
      const session = await mutation.mutateAsync({ data: values });
      queryClient.setQueryData<AuthSession>(getGetCurrentUserQueryKey(), session);
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      setLocation(dashboardForRole(session.user.role));
    } catch (e) { setError(errorMessage(e)); }
  }
  return <AuthFrame eyebrow="Join the cycle" title="Create your account." subtitle="Choose the role that best describes how you’ll take part.">
    <MutationAlert message={error} />
    <Form {...form}><form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
      <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel className="text-sm font-semibold">I’m joining as a…</FormLabel><FormControl><div className="grid grid-cols-2 gap-3">
        {(['FARMER','CONSUMER'] as const).map((role) => <button type="button" key={role} onClick={() => field.onChange(role)} aria-pressed={field.value === role} data-testid={`button-role-${role.toLowerCase()}`} className={`group rounded-xl border p-4 text-left transition ${field.value === role ? 'border-primary bg-[#e8eee4] ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/40'}`}><span className={`mb-3 grid size-9 place-items-center rounded-lg ${field.value === role ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>{role === 'FARMER' ? <Sprout size={18} /> : <Leaf size={18} />}</span><span className="block text-sm font-bold">{role === 'FARMER' ? 'Farmer' : 'Consumer'}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{role === 'FARMER' ? 'I grow and produce' : 'I choose and consume'}</span></button>)}
      </div></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel className="text-sm font-semibold">Full name</FormLabel><FormControl><Input {...field} autoComplete="name" placeholder="Your name" data-testid="input-register-name" className="h-11 rounded-xl border-[#dcd9cd] bg-card" /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel className="text-sm font-semibold">Email address</FormLabel><FormControl><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" data-testid="input-register-email" className="h-11 rounded-xl border-[#dcd9cd] bg-card" /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel className="text-sm font-semibold">Password</FormLabel><FormControl><div className="relative"><Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" data-testid="input-register-password" className="h-11 rounded-xl border-[#dcd9cd] bg-card pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary" data-testid="button-toggle-register-password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></FormControl><FormMessage /></FormItem>} />
      <Button type="submit" disabled={mutation.isPending} className="mt-2 h-12 w-full rounded-xl text-sm font-bold" data-testid="button-submit-register">{mutation.isPending ? <><span className="size-4 animate-pulse rounded-full bg-primary-foreground/40" />Creating your account…</> : <>Create account<ArrowRight size={16} /></>}</Button>
    </form></Form>
    <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-bold text-primary hover:underline" data-testid="link-login-from-register">Sign in</Link></p>
  </AuthFrame>;
}
