'use client'

import dynamic from 'next/dynamic'

const GasMap = dynamic(() => import('./GasMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 h-96 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading map...</div>
    </div>
  ),
})

export default function GasMapWrapper() {
  return <GasMap />
}
