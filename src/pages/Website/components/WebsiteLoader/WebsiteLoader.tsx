import { Loading } from '@/components/Loading/Loading'

interface WebsiteLoaderProps {
  children: React.ReactNode
  isLoading: boolean
}

export function WebsiteLoader({ children, isLoading }: WebsiteLoaderProps) {
  if (isLoading) {
    return <Loading />
  }

  return <>{children}</>
}
