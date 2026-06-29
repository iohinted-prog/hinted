import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const jwt = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt)

    if (userError || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { token } = await req.json()
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenHash = await hashToken(token)

    const { data: invite, error: inviteError } = await supabase
      .from('circle_invites')
      .select('*')
      .eq('invite_token_hash', tokenHash)
      .eq('status', 'pending')
      .maybeSingle()

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ ok: false, error: 'Invite not found or already used' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ ok: false, error: 'Invite has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userEmail = (user.email || '').trim().toLowerCase()
    const inviteEmail = (invite.invite_email_normalized || invite.invite_email || '').trim().toLowerCase()

    if (invite.invited_user_id && invite.invited_user_id !== user.id) {
      return new Response(JSON.stringify({ ok: false, error: 'Invite belongs to another user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!invite.invited_user_id && inviteEmail && userEmail && inviteEmail !== userEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'Invite email does not match signed-in user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingMembership, error: membershipCheckError } = await supabase
      .from('circle_members')
      .select('id')
      .eq('circle_id', invite.circle_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipCheckError) {
      return new Response(JSON.stringify({ ok: false, error: membershipCheckError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!existingMembership) {
      const { error: membershipInsertError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: invite.circle_id,
          user_id: user.id,
          role: invite.role || 'member',
          status: 'active',
        })

      if (membershipInsertError) {
        return new Response(JSON.stringify({ ok: false, error: membershipInsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { error: updateError } = await supabase
      .from('circle_invites')
      .update({
        status: 'accepted',
        invited_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (updateError) {
      return new Response(JSON.stringify({ ok: false, error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, circle_id: invite.circle_id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
