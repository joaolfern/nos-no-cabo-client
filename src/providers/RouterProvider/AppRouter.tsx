import { Suspense } from 'react'
import {
  type Location,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router'
import { AppProviders } from '@/providers'
import { appRoutes } from '@/providers/RouterProvider/appRoutes'

// Lists keep their place however the visitor returns ("Voltar", a breadcrumb, Back); every other
// page is remembered per history entry, so it opens at the top and Back returns to where it was.
const LIST_PATHS = ['/websites']

function scrollKey(location: Location) {
  return LIST_PATHS.includes(location.pathname)
    ? `${location.pathname}${location.search}`
    : location.key
}

function AppRoot() {
  return (
    <AppProviders>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <ScrollRestoration getKey={scrollKey} />
    </AppProviders>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(<Route element={<AppRoot />}>{appRoutes}</Route>)
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
