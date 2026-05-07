import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<Pick<WizardData, 'full_name' | 'year_group'>>) => void;
  onNext: () => void;
}

export default function Step1Name({ data, onChange, onNext }: Props) {
  const valid = data.full_name.trim().length > 0 && data.year_group !== null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s get started</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell us a bit about yourself.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="e.g. Alex Smith"
            value={data.full_name}
            onChange={e => onChange({ full_name: e.target.value })}
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Year group</Label>
          <div className="flex gap-3">
            {([10, 11] as const).map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => onChange({ year_group: yr })}
                className={cn(
                  'flex-1 rounded-lg border py-3 text-sm font-medium transition-colors',
                  data.year_group === yr
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-muted'
                )}
              >
                Year {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!valid} className="px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
