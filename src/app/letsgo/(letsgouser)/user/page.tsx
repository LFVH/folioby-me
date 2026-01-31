'use client'

import ManageSubscriptionButton from '@/components/letsgo/ManageSubscriptionButton'

export default function UserPage() {
  return (

        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400 text-center">
            Acesse sua assinatura:
            
          </p>
          <ManageSubscriptionButton />
        </div>

  )
}