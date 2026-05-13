import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyCodeButton } from './CopyCodeButton'
import { ResendPasswordButton } from './ResendPasswordButton'
import { SignOutButton } from '../dashboard/SignOutButton'

function formatMode(mode: string): string {
  switch (mode) {
    case 'multiple_choice': return 'MCQ'
    case 'true_false':      return 'True / False'
    case 'flashcards':      return 'Flashcards'
    case 'fillintheblank':  return 'Fill in the Blank'
    case 'matchup':         return 'Match-Up'
    default:                return mode
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

interface SessionDisplay {
  blockName: string
  topicName: string
  subjectName: string
  examBoard: string
  mode: string
  score: number | null
  total: number | null
  completedAt: string
}

export default async function ParentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role, subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'parent') redirect('/dashboard')

  const { data: codeData } = await supabase
    .from('student_codes')
    .select('code, student_user_id')
    .eq('parent_user_id', user.id)
    .single()

  const studentCode = codeData?.code ?? null
  const studentUserId = (codeData as any)?.student_user_id as string | null ?? null

  // --- Student progress data ---
  let studentInfo: { full_name: string | null; year_group: string | null } | null = null
  let enrolledSubjects: Array<{ name: string; exam_board: string }> = []
  let sessions: SessionDisplay[] = []

  if (studentUserId) {
    const [studentResult, subjectsResult, sessionsResult] = await Promise.all([
      supabase
        .from('users')
        .select('full_name, year_group')
        .eq('id', studentUserId)
        .single(),
      supabase
        .from('user_subjects')
        .select('subjects(name, exam_board)')
        .eq('user_id', studentUserId),
      supabase
        .from('sessions')
        .select(`
          mode, score, total, completed_at,
          blocks(
            block_name,
            topics(
              name,
              subjects(name, exam_board)
            )
          )
        `)
        .eq('user_id', studentUserId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(50),
    ])

    if (studentResult.data) {
      studentInfo = studentResult.data as { full_name: string | null; year_group: string | null }
    }

    enrolledSubjects = ((subjectsResult.data ?? []) as any[])
      .map((row: any) => {
        const s = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects
        return s as { name: string; exam_board: string } | null
      })
      .filter((s): s is { name: string; exam_board: string } => s !== null)
      .sort((a, b) => a.name.localeCompare(b.name))

    sessions = ((sessionsResult.data ?? []) as any[]).map((sess: any) => {
      const block  = Array.isArray(sess.blocks) ? sess.blocks[0] : sess.blocks
      const topic  = block  ? (Array.isArray(block.topics)   ? block.topics[0]   : block.topics)   : null
      const subject = topic ? (Array.isArray(topic.subjects) ? topic.subjects[0] : topic.subjects) : null
      return {
        blockName:   block?.block_name ?? 'Unknown block',
        topicName:   topic?.name       ?? 'Unknown topic',
        subjectName: subject?.name     ?? 'Unknown subject',
        examBoard:   subject?.exam_board ?? '',
        mode:        sess.mode         ?? '',
        score:       sess.score        ?? null,
        total:       sess.total        ?? null,
        completedAt: sess.completed_at ?? '',
      }
    })
  }

  const totalCompleted = sessions.length
  const enrolledCount  = enrolledSubjects.length
  const validSessions  = sessions.filter((s) => s.total != null && s.total > 0)
  const avgPct = validSessions.length > 0
    ? Math.round(
        validSessions.reduce((sum, s) => sum + ((s.score ?? 0) / (s.total!)) * 100, 0) /
        validSessions.length
      )
    : null

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6 py-10">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
          <SignOutButton />
        </div>

        {/* Student access code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your child&apos;s access code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentCode ? (
              <>
                <div className="flex items-center gap-3 rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-3">
                  <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-primary">
                    {studentCode}
                  </span>
                  <CopyCodeButton code={studentCode} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this with your child. They enter it at{' '}
                  <strong>revision-breakdown.vercel.app/login</strong> to log straight in — no email or
                  password needed.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No student code found. If you just paid, it may take a moment — refresh the page.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Student progress ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your child&apos;s progress</h2>

          {/* Linked student banner */}
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            {studentUserId && studentInfo ? (
              <p className="font-semibold text-card-foreground">
                Your child:{' '}
                <span className="text-primary">{studentInfo.full_name ?? 'Student'}</span>
                {studentInfo.year_group && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    Year {studentInfo.year_group}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your child hasn&apos;t logged in yet — share the code above to get started.
              </p>
            )}
          </div>

          {studentUserId && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card px-4 py-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{totalCompleted}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Blocks completed</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-4 text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {avgPct != null ? `${avgPct}%` : '—'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Average score</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{enrolledCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Subjects enrolled</p>
                </div>
              </div>

              {/* Enrolled subjects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subjects enrolled</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrolledSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {enrolledSubjects.map((s) => (
                        <span
                          key={`${s.name}-${s.exam_board}`}
                          className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-card-foreground"
                        >
                          {s.name}
                          <span className="ml-1.5 text-xs text-muted-foreground">{s.exam_board}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects selected yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="flex flex-col divide-y divide-border">
                      {sessions.map((sess, i) => {
                        const pct =
                          sess.total && sess.total > 0
                            ? Math.round(((sess.score ?? 0) / sess.total) * 100)
                            : null
                        return (
                          <div key={i} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-card-foreground">
                                  {sess.subjectName}
                                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    {sess.examBoard}
                                  </span>
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {sess.topicName} — {sess.blockName}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatMode(sess.mode)}
                                  {sess.completedAt && ` · ${formatDate(sess.completedAt)}`}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                {pct != null ? (
                                  <>
                                    <p className="text-sm font-bold text-foreground">
                                      {sess.score} / {sess.total}
                                    </p>
                                    <p
                                      className={`text-xs font-medium ${
                                        pct >= 70
                                          ? 'text-green-600'
                                          : pct >= 50
                                          ? 'text-amber-600'
                                          : 'text-red-500'
                                      }`}
                                    >
                                      {pct}%
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-xs text-muted-foreground">—</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No activity yet — encourage your child to start revising!
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Subscription status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-medium capitalize ${
                  userRow?.subscription_status === 'active' ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {userRow?.subscription_status ?? 'Unknown'}
              </span>
            </div>
            {userRow?.subscription_expires_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {new Date(userRow.subscription_expires_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resend password reset email */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Forgot your password?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Send a new login link to <strong>{user.email}</strong>.
            </p>
            <ResendPasswordButton email={user.email!} />
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
