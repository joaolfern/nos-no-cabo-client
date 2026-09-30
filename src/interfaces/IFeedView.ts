export type FeedView = 'grid' | 'list'

export const FEED_VIEWS: FeedView[] = ['grid', 'list']

export function isFeedView(value: string): value is FeedView {
  return (FEED_VIEWS as string[]).includes(value)
}
