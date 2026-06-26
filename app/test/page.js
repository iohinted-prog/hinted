'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const testInviteFunction = async () => {
    setLoading(true)

    const { data, error } = await supabase.functions.invoke('send-circle-invite', {
      body: { test: true },
    })

    const output = {
      data: data ?? null,
      error: error
        ? {
            name: error.name,
            message: error.message,
          }
        : null,
    }

    console.log('invite function result:', output)
    setResult(output)
    setLoading(false)

    alert(JSON.stringify(output, null, 2))
  }

  return (
    <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '16px' }}>Test page</h1>

      <button
        onClick={testInviteFunction}
        disabled={loading}
        style={{
          display: 'inline-block',
          padding: '12px 16px',
          backgroundColor: loading ? '#666' : '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'default' : 'pointer',
          fontSize: '16px',
        }}
      >
        {loading ? 'Testing...' : 'Test invite function'}
      </button>

      <pre
        style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f4f4f4',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {result ? JSON.stringify(result, null, 2) : 'No result yet.'}
      </pre>
    </main>
  )
}
