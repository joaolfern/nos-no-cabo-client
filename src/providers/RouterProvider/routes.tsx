import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'

// Each page is its own chunk: a visitor downloads only the pages they open.
const LandingPage = lazy(() =>
  import('@/pages/LandingPage/LandingPage').then((module) => ({
    default: module.LandingPage,
  }))
)
const Feed = lazy(() =>
  import('@/pages/Feed/Feed').then((module) => ({ default: module.Feed }))
)
const Website = lazy(() =>
  import('@/pages/Website/Website').then((module) => ({
    default: module.Website,
  }))
)
const SubmitWebsite = lazy(() =>
  import('@/pages/SubmitWebsite/SubmitWebsite').then((module) => ({
    default: module.SubmitWebsite,
  }))
)
const WidgetEditor = lazy(() =>
  import('@/pages/WidgetEditor/WidgetEditor').then((module) => ({
    default: module.WidgetEditor,
  }))
)
const Terms = lazy(() =>
  import('@/pages/Terms/Terms').then((module) => ({ default: module.Terms }))
)
const NotFound = lazy(() =>
  import('@/pages/NotFound/NotFound').then((module) => ({
    default: module.NotFound,
  }))
)

export function Router() {
  return (
    <Suspense fallback={null}>
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
    </Suspense>
  )
}
