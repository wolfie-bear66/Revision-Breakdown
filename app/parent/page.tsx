import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyCodeButton } from './CopyCodeButton'
import { ResendPasswordButton } from './ResendPasswordButton'
import { SignOutButton } from '../dashboard/SignOutButton'

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
    .select('code')
    .eq('parent_user_id', user.id)
    .single()

  const studentCode = codeData?.code ?? null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">

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
