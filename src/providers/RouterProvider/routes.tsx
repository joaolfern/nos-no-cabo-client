import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { Feed } from '@/pages/Feed/Feed'
import { LandingPage } from '@/pages/LandingPage/LandingPage'
import { NotFound } from '@/pages/NotFound/NotFound'
import { Website } from '@/pages/Website/Website'
import { WebsiteFormProvider } from '@/pages/WebsiteForm/contexts/WebsiteFormContext/WebsiteFormProvider'
import { WebsiteFormModal } from '@/pages/WebsiteForm/WebsiteFormModal'
import { Route, Routes } from 'react-router'

export function Router() {
  return (
    <WebsiteFormProvider>
      <Routes>
        <Route Component={LandingPage} index />
        <Route Component={NosNoCaboLayout}>
          <Route Component={Website} path='/website/:id' />
          <Route Component={Feed} path='/websites' />
        </Route>
        <Route Component={NotFound} path='*' />
      </Routes>
      <WebsiteFormModal />
    </WebsiteFormProvider>
  )
}
