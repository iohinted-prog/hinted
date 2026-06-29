import { Suspense } from 'react'
import JoinClient from './JoinClient'

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fffaf7]" />}>
      <JoinClient />
    </Suspense>
  )
}
