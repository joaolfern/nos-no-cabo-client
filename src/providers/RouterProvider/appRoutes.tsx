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
} from '@/providers/RouterProvider/lazyPages'
import { NotFound } from '@/pages/NotFound/NotFound'
import { LandingSkeleton } from '@/pages/LandingPage/components/LandingSkeleton/LandingSkeleton'
import { WidgetEditorSkeleton } from '@/pages/WidgetEditor/components/WidgetEditorSkeleton/WidgetEditorSkeleton'
import { TermsSkeleton } from '@/pages/Terms/components/TermsSkeleton/TermsSkeleton'
import { FeedSkeleton } from '@/pages/Feed/components/FeedSkeleton/FeedSkeleton'
import { SubmitWebsiteSkeleton } from '@/pages/SubmitWebsite/components/SubmitWebsiteSkeleton/SubmitWebsiteSkeleton'
import { WebsiteLayout } from '@/pages/Website/components/WebsiteLayout/WebsiteLayout'
import { WebsiteSkeleton } from '@/pages/Website/components/WebsiteSkeleton/WebsiteSkeleton'

export const appRoutes = (
  <>
    <Route
      element={
        <Suspense fallback={<LandingSkeleton />}>
          <LandingPage />
        </Suspense>
      }
      index
    />
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
      <Route
        element={
          <Suspense fallback={<SubmitWebsiteSkeleton />}>
            <SubmitWebsite />
          </Suspense>
        }
        path='/websites/novo'
      />
      <Route
        element={
          <Suspense fallback={<WidgetEditorSkeleton />}>
            <WidgetEditor />
          </Suspense>
        }
        path='/websites/:id/selo'
      />
      <Route
        element={
          <Suspense fallback={<TermsSkeleton />}>
            <Terms />
          </Suspense>
        }
        path='/termos'
      />
    </Route>
    {/* The ring router answers these; they reach the site only when it fails open. */}
    <Route element={<Navigate to='/' replace />} path='/ring/*' />
    <Route element={<Navigate to='/' replace />} path='/r/*' />
    <Route Component={NotFound} path='*' />
  </>
)
