import { useUrlQuery } from '@/components/Link/hooks/useUrlQuery'
import { Website } from '@/pages/Website/Website'
import { Feed } from '@/pages/Feed/Feed'
import { useEffect } from 'react'
import { WebsiteForm } from '@/pages/WebsiteForm/WebsiteForm'

export function NosNoCabo() {
  const { id, action } = useUrlQuery('id')
  const hasSelectedWebsite = !!id

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id, action])

  if (action) {
    return <WebsiteForm />
  }

  return hasSelectedWebsite ? <Website id={id} /> : <Feed />
}
