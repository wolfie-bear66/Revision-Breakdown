import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Subject, WizardData } from '../page';

const CATEGORY_ORDER = [
  'Sciences',
  'Maths',
  'English',
  'Humanities',
  'Languages',
  'Business & Technology',
  'Arts & Creative',
  'Technology & Applied',
];

interface Props {
  data: WizardData;
  subjects: Subject[];
  loading: boolean;
  onChange: (selected: Set<string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Subjects({
  data,
  subjects,
  loading,
  onChange,
  onNext,
  onBack,
}: Props) {
  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  function toggle(id: string) {
    const next = new Set(data.selectedSubjectIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Choose your subjects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select all the subjects you&apos;re studying.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading subjects…</div>
      ) : (
        <div className="max-h-[52vh] space-y-6 overflow-y-auto pr-1">
          {Object.entries(grouped)
            .sort(([a], [b]) => {
              const ai = CATEGORY_ORDER.indexOf(a);
              const bi = CATEGORY_ORDER.indexOf(b);
              return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            })
            .map(([category, items]) => (
            <div key={category}>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map(s => {
                  const selected = data.selectedSubjectIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      )}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span
                        className={cn(
                          'ml-1.5 text-xs',
                          selected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {s.exam_board}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-6">
          Back
        </Button>
        <Button onClick={onNext} disabled={data.selectedSubjectIds.size === 0} className="px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
