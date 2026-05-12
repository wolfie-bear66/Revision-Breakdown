'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function ResetTopicsButton() {
  const router = useRouter()

  async function handleReset() {
    const confirmed = window.confirm(
      'This will remove all your chosen subjects and topics and take you back to the setup screen. Are you sure?'
    )
    if (!confirmed) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userSubjects } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', user.id)

    const userSubjectIds = userSubjects?.map((s) => s.id) ?? []

    if (userSubjectIds.length > 0) {
      await supabase.from('user_topics').delete().in('user_subject_id', userSubjectIds)
    }

    await supabase.from('user_subjects').delete().eq('user_id', user.id)

    await supabase.from('users').update({ onboarding_complete: false }).eq('id', user.id)

    router.push('/onboarding')
  }

  return (
    <button
      onClick={handleReset}
      className="text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:border-destructive hover:text-destructive transition-colors"
    >
      Reset chosen topics
    </button>
  )
}
