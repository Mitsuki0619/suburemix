import React from 'react'

import { BackButton } from '~/components/back-button'
export const BackButtonLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-3">
      <BackButton />
      {children}
    </div>
  )
}
