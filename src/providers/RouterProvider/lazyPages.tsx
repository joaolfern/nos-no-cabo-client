import { lazy } from 'react'

// Each page is its own chunk: a visitor downloads only the pages they open.
export const LandingPage = lazy(() =>
  import('@/pages/LandingPage/LandingPage').then((module) => ({
    default: module.LandingPage,
  }))
)
export const Feed = lazy(() =>
  import('@/pages/Feed/Feed').then((module) => ({ default: module.Feed }))
)
export const Website = lazy(() =>
  import('@/pages/Website/Website').then((module) => ({
    default: module.Website,
  }))
)
export const SubmitWebsite = lazy(() =>
  import('@/pages/SubmitWebsite/SubmitWebsite').then((module) => ({
    default: module.SubmitWebsite,
  }))
)
export const WidgetEditor = lazy(() =>
  import('@/pages/WidgetEditor/WidgetEditor').then((module) => ({
    default: module.WidgetEditor,
  }))
)
export const Terms = lazy(() =>
  import('@/pages/Terms/Terms').then((module) => ({ default: module.Terms }))
)
export const NotFound = lazy(() =>
  import('@/pages/NotFound/NotFound').then((module) => ({
    default: module.NotFound,
  }))
)
