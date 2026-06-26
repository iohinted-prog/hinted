'use client'

import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const testInviteFunction = async () => {
    const { data, error } = await supabase.functions.invoke('send-circle-invite', {
      body: { test: true },
    })

    console.log('data:', data)
    console.log('error:', error)
    alert(JSON.stringify({ data, error }, null, 2))
  }

  return (
    <main style={{ padding: '24px' }}>
      <h1>Test page</h1>
      <button onClick={testInviteFunction}>
        Test invite function
      </button>
    </main>
  )
}
