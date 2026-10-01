import { useMemo } from 'react'
import { NOS_NO_CABO_URL, RING_BASE_URL } from '@/config/env'
import { buildWidgetSnippet } from '@/pages/WidgetEditor/utils/buildWidgetSnippet'
import type { WidgetOptions } from '@/pages/WidgetEditor/utils/widgetPresets'

type WidgetRenderProps = {
  websiteId: string
  options: WidgetOptions
  className?: string
}

// Renders the exact snippet people copy, so the preview can't drift from the output.
export function WidgetRender({
  websiteId,
  options,
  className,
}: WidgetRenderProps) {
  const html = useMemo(
    () =>
      buildWidgetSnippet({
        websiteId,
        options,
        homeUrl: NOS_NO_CABO_URL,
        ringBaseUrl: RING_BASE_URL,
      }),
    [websiteId, options]
  )

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
