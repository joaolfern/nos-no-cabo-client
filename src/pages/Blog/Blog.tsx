import { useUrlQuery } from '@/components/Link/hooks/useUrlQuery'
import { Website } from '@/pages/Website/Website'
import { Feed } from '@/pages/Feed/Feed'
import { useEffect } from 'react'

export function Blog() {
  const { id } = useUrlQuery('id')
  const hasSelectedWebsite = !!id

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  return hasSelectedWebsite ? <Website id={id} /> : <Feed />
}
