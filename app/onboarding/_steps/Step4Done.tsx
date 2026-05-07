import { Button } from '@/components/ui/button';
import type { Subject, Topic, WizardData } from '../page';

interface Props {
  data: WizardData;
  subjects: Subject[];
  topics: Topic[];
  saving: boolean;
  onBack: () => void;
  onFinish: () => void;
}

export default function Step4Done({ data, subjects, topics, saving, onBack, onFinish }: Props) {
  const selectedSubjects = subjects.filter(s => data.selectedSubjectIds.has(s.id));
  const firstName = data.full_name.split(' ')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">You&apos;re all set, {firstName}!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s a summary of what you&apos;ve chosen.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {selectedSubjects.map(s => {
          const selectedCount = topics.filter(
            t => t.subject_id === s.id && data.selectedTopicIds.has(t.id)
          ).length;
          return (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-medium">{s.name}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">{s.exam_board}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedCount} topic{selectedCount !== 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={saving} className="px-6">
          Back
        </Button>
        <Button onClick={onFinish} disabled={saving} className="px-6">
          {saving ? 'Saving…' : 'Start revising'}
        </Button>
      </div>
    </div>
  );
}
