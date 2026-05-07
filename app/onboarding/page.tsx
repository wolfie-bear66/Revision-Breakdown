'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Step1Name from './_steps/Step1Name';
import Step2Subjects from './_steps/Step2Subjects';
import Step3Topics from './_steps/Step3Topics';
import Step4Done from './_steps/Step4Done';

export type Subject = {
  id: string;
  name: string;
  exam_board: string;
  category: string;
};

export type Topic = {
  id: string;
  subject_id: string;
  name: string;
};

export interface WizardData {
  full_name: string;
  year_group: 10 | 11 | null;
  selectedSubjectIds: Set<string>;
  selectedTopicIds: Set<string>;
}

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<WizardData>({
    full_name: '',
    year_group: null,
    selectedSubjectIds: new Set(),
    selectedTopicIds: new Set(),
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    if (step !== 2 || subjects.length > 0) return;
    setSubjectsLoading(true);
    createClient()
      .from('subjects')
      .select('id, name, exam_board, category')
      .order('category')
      .order('name')
      .then(({ data: rows }) => {
        setSubjects(rows ?? []);
        setSubjectsLoading(false);
      });
  }, [step, subjects.length]);

  // Re-fetch topics every time the user enters step 3 so subject changes are picked up
  useEffect(() => {
    if (step !== 3) return;
    const subjectIds = [...data.selectedSubjectIds];
    if (subjectIds.length === 0) return;
    setTopicsLoading(true);
    createClient()
      .from('topics')
      .select('id, subject_id, name')
      .in('subject_id', subjectIds)
      .order('name')
      .then(({ data: rows }) => {
        const fetched = rows ?? [];
        setTopics(fetched);
        setData(prev => ({
          ...prev,
          selectedTopicIds: new Set(fetched.map(t => t.id)),
        }));
        setTopicsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function next() {
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setStep(s => Math.max(s - 1, 1));
  }

  async function handleFinish() {
    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('users')
      .update({ full_name: data.full_name, year_group: data.year_group, onboarding_complete: true })
      .eq('id', user.id);

    const subjectIds = [...data.selectedSubjectIds];
    const { data: userSubjects } = await supabase
      .from('user_subjects')
      .insert(subjectIds.map(subject_id => ({ user_id: user.id, subject_id })))
      .select('id, subject_id');

    const subjectToUserSubject = new Map<string, string>(
      (userSubjects ?? []).map(us => [us.subject_id, us.id])
    );

    const topicRows = topics
      .filter(t => data.selectedTopicIds.has(t.id))
      .flatMap(t => {
        const user_subject_id = subjectToUserSubject.get(t.subject_id);
        return user_subject_id ? [{ user_subject_id, topic_id: t.id }] : [];
      });

    if (topicRows.length > 0) {
      await supabase.from('user_topics').insert(topicRows);
    }

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="mb-2 text-xs text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <Step1Name
            data={data}
            onChange={patch => setData(prev => ({ ...prev, ...patch }))}
            onNext={next}
          />
        )}
        {step === 2 && (
          <Step2Subjects
            data={data}
            subjects={subjects}
            loading={subjectsLoading}
            onChange={selectedSubjectIds => setData(prev => ({ ...prev, selectedSubjectIds }))}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <Step3Topics
            data={data}
            topics={topics}
            subjects={subjects}
            loading={topicsLoading}
            onChange={selectedTopicIds => setData(prev => ({ ...prev, selectedTopicIds }))}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <Step4Done
            data={data}
            subjects={subjects}
            topics={topics}
            saving={saving}
            onBack={back}
            onFinish={handleFinish}
          />
        )}
      </div>
    </main>
  );
}
