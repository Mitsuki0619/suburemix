import { ReactNode } from 'react'

import { UserForClient } from '~/routes/_index'

import { Header } from './header'

export interface LayoutProps {
  children: ReactNode
  user: UserForClient | undefined
}

export const Layout = ({ children, user }: LayoutProps) => {
  return (
    <div>
      <Header user={user} />
      {children}
    </div>
  )
}
