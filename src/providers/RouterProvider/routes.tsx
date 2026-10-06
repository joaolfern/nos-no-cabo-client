import { Suspense } from 'react'
import { Routes } from 'react-router'
import { appRoutes } from '@/providers/RouterProvider/appRoutes'

export function Router() {
  return (
    <Suspense fallback={null}>
      <Routes>{appRoutes}</Routes>
    </Suspense>
  )
}
