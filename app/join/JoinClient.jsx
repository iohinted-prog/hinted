'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import GoogleAuthButtons from '../components/GoogleAuthButtons'

function LandingLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-2xl text-white shadow-lg">
        🎁
      </div>
      <div className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-900">
        Hinted<span className="text-[#f36f64]">.io</span>
      </div>
    </div>
  )
}

export default function JoinClient() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite_token')
  const inviteType = searchParams.get('invite_type')

  const isContactInvite = inviteType === 'contact'
  const isCircleInvite = inviteType === 'circle'

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-6 md:px-8">
        <header className="pb-8">
          <LandingLogo />
        </header>

        <div className="mx-auto max-w-[540px]">
          {isContactInvite && (
            <div className="mb-6 rounded-[22px] border border-[#f1e4dc] bg-[#fff8f4] p-4">
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold">You have been invited as a contact on Hinted.</span>{' '}
                Sign in or create an account to accept and share your birthday.
              </p>
            </div>
          )}

          {isCircleInvite && (
            <div className="mb-6 rounded-[22px] border border-[#f1e4dc] bg-[#fff8f4] p-4">
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold">You have been invited to join a pot on Hinted.</span>{' '}
                Sign in or create an account to view and join the group pot.
              </p>
            </div>
          )}

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl md:p-7">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                  {isContactInvite || isCircleInvite ? 'Accept your invite' : 'Join Hinted'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isContactInvite || isCircleInvite
                    ? 'Sign in or create an account to continue.'
                    : 'Keep your circles, hints, reminders, and shop saves connected with a secure sign in.'}
                </p>
              </div>
              <div className="rounded-full bg-[#fff0e8] px-3 py-2 text-[12px] font-bold text-[#ea7451]">
                Google or Microsoft
              </div>
            </div>

            <div className="space-y-4">
              <GoogleAuthButtons
                variant="hero-primary"
                inviteToken={inviteToken}
                inviteType={inviteType}
              />

              <div className="rounded-[22px] border border-[#f3e4db] bg-[#fff8f4] p-4">
                <p className="text-sm leading-6 text-slate-600">
                  New here? Use Google or Microsoft to create your account.
                  Returning users can log in the exact same way.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              By continuing, you agree to Hinted's{' '}
              <Link href="/terms" className="font-medium text-slate-700 underline underline-offset-2">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-slate-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-slate-700 underline underline-offset-2">
              Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
