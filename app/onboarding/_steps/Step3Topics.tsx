import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Subject, Topic, WizardData } from '../page';

interface Props {
  data: WizardData;
  topics: Topic[];
  subjects: Subject[];
  loading: boolean;
  onChange: (selected: Set<string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Topics({
  data,
  topics,
  subjects,
  loading,
  onChange,
  onNext,
  onBack,
}: Props) {
  const selectedSubjects = subjects.filter(s => data.selectedSubjectIds.has(s.id));

  function toggle(id: string) {
    const next = new Set(data.selectedTopicIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function toggleSubject(subjectId: string) {
    const subjectTopics = topics.filter(t => t.subject_id === subjectId);
    const allSelected = subjectTopics.every(t => data.selectedTopicIds.has(t.id));
    const next = new Set(data.selectedTopicIds);
    subjectTopics.forEach(t => (allSelected ? next.delete(t.id) : next.add(t.id)));
    onChange(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pick your topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All topics are selected by default. Deselect any you&apos;re not covering.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading topics…</div>
      ) : (
        <div className="max-h-[52vh] space-y-6 overflow-y-auto pr-1">
          {selectedSubjects.map(subject => {
            const subjectTopics = topics.filter(t => t.subject_id === subject.id);
            const allSelected = subjectTopics.every(t => data.selectedTopicIds.has(t.id));

            return (
              <div key={subject.id}>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {subject.name}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {subject.exam_board}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjectTopics.map(t => {
                    const selected = data.selectedTopicIds.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        className={cn(
                          'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-muted'
                        )}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-6">
          Back
        </Button>
        <Button onClick={onNext} disabled={data.selectedTopicIds.size === 0} className="px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
