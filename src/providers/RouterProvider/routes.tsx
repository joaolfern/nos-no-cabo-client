import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { Feed } from '@/pages/Feed/Feed'
import { LandingPage } from '@/pages/LandingPage/LandingPage'
import { NotFound } from '@/pages/NotFound/NotFound'
import { FloatingButtons } from '@/pages/Website/components/FloatingButtons/FloatingButtons'
import { Website } from '@/pages/Website/Website'
import { Route } from 'react-router'
import { Routes } from 'react-router'

export function Router() {
  return (
    <>
      <Routes>
        <Route Component={LandingPage} index />
        <Route Component={NosNoCaboLayout}>
          <Route Component={Website} path='/website/:id' />
          <Route Component={Feed} path='/websites' />
        </Route>
        <Route Component={NotFound} path='*' />
      </Routes>
      <FloatingButtons />
    </>
  )
}
