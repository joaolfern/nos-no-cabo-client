import { Suspense } from 'react'
import { Navigate, Route } from 'react-router'
import { NosNoCaboLayout } from '@/layouts/NosNoCaboLayout/NosNoCaboLayout'
import {
  LandingPage,
  Feed,
  Website,
  SubmitWebsite,
  WidgetEditor,
  Terms,
  NotFound,
} from '@/providers/RouterProvider/lazyPages'
import { FeedSkeleton } from '@/pages/Feed/components/FeedSkeleton/FeedSkeleton'
import { WebsiteLayout } from '@/pages/Website/components/WebsiteLayout/WebsiteLayout'
import { WebsiteSkeleton } from '@/pages/Website/components/WebsiteSkeleton/WebsiteSkeleton'

export const appRoutes = (
  <>
    <Route Component={LandingPage} index />
    <Route Component={NosNoCaboLayout}>
      <Route
        element={
          <Suspense
            fallback={
              <WebsiteLayout>
                <WebsiteSkeleton />
              </WebsiteLayout>
            }
          >
            <Website />
          </Suspense>
        }
        path='/website/:id'
      />
      <Route
        element={
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        }
        path='/websites'
      />
    </Route>
    <Route element={<NosNoCaboLayout variant='focused' />}>
      <Route Component={SubmitWebsite} path='/websites/novo' />
      <Route Component={WidgetEditor} path='/websites/:id/selo' />
      <Route Component={Terms} path='/termos' />
    </Route>
    {/* The ring router answers these; they reach the site only when it fails open. */}
    <Route element={<Navigate to='/' replace />} path='/ring/*' />
    <Route element={<Navigate to='/' replace />} path='/r/*' />
    <Route Component={NotFound} path='*' />
  </>
)
