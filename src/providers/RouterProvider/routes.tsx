import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import { Feed } from '@/pages/Feed/Feed'
import { LandingPage } from '@/pages/LandingPage/LandingPage'
import { NotFound } from '@/pages/NotFound/NotFound'
import { SubmitWebsite } from '@/pages/SubmitWebsite/SubmitWebsite'
import { Terms } from '@/pages/Terms/Terms'
import { Website } from '@/pages/Website/Website'
import { WidgetEditor } from '@/pages/WidgetEditor/WidgetEditor'
import { Route, Routes } from 'react-router'

export function Router() {
  return (
    <Routes>
      <Route Component={LandingPage} index />
      <Route Component={NosNoCaboLayout}>
        <Route Component={Website} path='/website/:id' />
        <Route Component={Feed} path='/websites' />
      </Route>
      <Route element={<NosNoCaboLayout variant='focused' />}>
        <Route Component={SubmitWebsite} path='/websites/novo' />
        <Route Component={WidgetEditor} path='/websites/:id/selo' />
        <Route Component={Terms} path='/termos' />
      </Route>
      <Route Component={NotFound} path='*' />
    </Routes>
  )
}
