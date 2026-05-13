import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

const badgeMap: Record<string, string> = {
  'Biology (Combined)': 'Badge-Biology.webp',
  'Biology (Separate)': 'Badge-Biology.webp',
  'Chemistry (Combined)': 'Badge-Chemistry.webp',
  'Chemistry (Separate)': 'Badge-Chemistry.webp',
  'Physics (Combined)': 'Badge-Physics.webp',
  'Physics (Separate)': 'Badge-Physics.webp',
  'Business Studies': 'Badge-BusinessStudies.webp',
  'Computer Science': 'Badge-ComputerScience.webp',
  'Design & Technology': 'Badge-DesignTechnology.webp',
  'Drama': 'Badge-Drama.webp',
  'English Language': 'Badge-EnglishLanguage.webp',
  'English Literature': 'Badge-EnglishLiterature.webp',
  'Film Studies': 'Badge-FilmStudies.webp',
  'Food Preparation & Nutrition': 'Badge-FoodPrepandNutrition.webp',
  'French': 'Badge-French.webp',
  'Geography': 'Badge-Geography.webp',
  'German': 'Badge-German.webp',
  'Health & Social Care': 'Badge-HealthandSocialCare.webp',
  'History': 'Badge-History.webp',
  'Maths': 'Badge-Maths.webp',
  'Media Studies': 'Badge-MediaStudies.webp',
  'Music': 'Badge-Music.webp',
  'Physical Education': 'Badge-PE.webp',
  'Psychology': 'Badge-Psychology.webp',
  'Religious Studies': 'Badge-RE.webp',
  'Sociology': 'Badge-Sociology.webp',
  'Spanish': 'Badge-Spanish.webp',
};

type SubjectProgress = {
  subject_id: string;
  subject_name: string;
  total_blocks: number;
  completed_blocks: number;
};

export default async function TrophyCabinetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let subjects: SubjectProgress[] = [];
  let fetchError = false;

  try {
    const { data, error } = await supabase
      .from('user_subject_progress')
      .select('subject_id, subject_name, total_blocks, completed_blocks')
      .eq('user_id', user.id);

    if (error) throw error;
    subjects = (data ?? []) as SubjectProgress[];
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <main
        style={{ background: '#0e0e0e', minHeight: '100vh' }}
        className="flex items-center justify-center p-8"
      >
        <p style={{ color: '#f87171' }} className="text-center text-sm">
          Something went wrong loading your Trophy Cabinet. Please try again later.
        </p>
      </main>
    );
  }

  if (subjects.length === 0) {
    return (
      <main
        style={{ background: '#0e0e0e', minHeight: '100vh', color: '#fff' }}
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <p style={{ color: '#888' }} className="text-sm">
          No subjects enrolled yet. Head to your dashboard to get started.
        </p>
        <Link
          href="/dashboard"
          style={{ background: '#3dd9a4', color: '#000' }}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
        >
          Go to Dashboard
        </Link>
      </main>
    );
  }

  const badgeSubjects = subjects.filter((s) => badgeMap[s.subject_name]);
  const earnedSet = new Set(
    badgeSubjects
      .filter((s) => s.total_blocks > 0 && Number(s.completed_blocks) >= Number(s.total_blocks))
      .map((s) => s.subject_id)
  );

  let earnedAnimIdx = 0;
  const badgesWithMeta = badgeSubjects.map((subject) => {
    const isEarned = earnedSet.has(subject.subject_id);
    const animDelay = isEarned ? earnedAnimIdx++ * 100 : 0;
    return { ...subject, isEarned, animDelay };
  });

  return (
    <main style={{ background: '#0e0e0e', minHeight: '100vh', color: '#fff' }} className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Back nav */}
        <Link
          href="/dashboard"
          style={{ color: '#888' }}
          className="mb-8 flex w-fit items-center gap-1 text-sm transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold tracking-tight">Trophy Cabinet</h1>
          <p style={{ color: '#888' }} className="mb-3 text-sm">
            Earn a badge by completing every block in a subject
          </p>
          <span style={{ color: '#3dd9a4' }} className="text-sm font-semibold">
            {earnedSet.size} / {badgeSubjects.length} badges earned
          </span>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {badgesWithMeta.map(({ subject_id, subject_name, isEarned, animDelay }) => {
            const filename = badgeMap[subject_name];

            return (
              <div
                key={subject_id}
                style={{
                  background: isEarned ? '#242424' : '#1a1a1a',
                  border: '1px solid #333333',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  ...(isEarned && {
                    animation: 'badge-enter 0.4s ease-out both',
                    animationDelay: `${animDelay}ms`,
                  }),
                }}
              >
                {/* Subject name */}
                <p
                  style={{ color: '#e0e0e0' }}
                  className="w-full text-center text-xs font-bold leading-tight"
                >
                  {subject_name}
                </p>

                {/* Badge image */}
                <div className="relative flex items-center justify-center overflow-hidden" style={{ width: '80%', aspectRatio: '1 / 1' }}>
                  <Image
                    src={`/badges/${filename}`}
                    alt={`${subject_name} badge`}
                    width={160}
                    height={160}
                    className="h-full w-full object-contain"
                    style={
                      isEarned
                        ? { filter: 'drop-shadow(0 0 16px rgba(245,166,35,0.7))' }
                        : { filter: 'grayscale(100%) opacity(35%) blur(3px)' }
                    }
                  />
                  {!isEarned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock style={{ color: '#888', width: 24, height: 24 }} />
                    </div>
                  )}
                </div>

                {/* Status */}
                {isEarned ? (
                  <span
                    style={{
                      background: 'rgba(61,217,164,0.15)',
                      color: '#3dd9a4',
                      borderRadius: '9999px',
                      padding: '2px 12px',
                    }}
                    className="text-xs font-semibold"
                  >
                    Earned
                  </span>
                ) : (
                  <p style={{ color: '#666' }} className="text-center text-xs">
                    Complete all blocks to unlock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
