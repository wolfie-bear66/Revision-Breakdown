'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
