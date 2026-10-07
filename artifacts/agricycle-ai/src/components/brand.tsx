import { Sprout } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" data-testid="brand-agricycle">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sprout size={19} strokeWidth={2} />
      </span>
      {!compact && <span className="font-serif text-lg font-extrabold tracking-[-.045em]">AgriCycle<span className="text-primary"> AI</span></span>}
    </span>
  );
}
