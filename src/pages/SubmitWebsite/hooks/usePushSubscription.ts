import { useEffect, useMemo } from 'react'
import { v1Api } from '@/api/api'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { usePendingSubmissions } from '@/pages/SubmitWebsite/hooks/usePendingSubmissions'
import {
  getPushSubscription,
  pushPublicKey,
} from '@/pages/SubmitWebsite/utils/pushSubscription'

// Lets the server notify a submitter who closed the site; polling covers the open tab.
export function usePushSubscription() {
  const { drafts, markPushSubscribed } = usePendingSubmissions()
  const { permission } = useNotificationPermission()

  const unsubscribed = useMemo(
    () =>
      drafts.filter(
        (draft) => draft.status === 'checking' && !draft.pushSubscribed
      ),
    [drafts]
  )

  useEffect(() => {
    const publicKey = pushPublicKey()
    if (!publicKey || permission !== 'granted' || unsubscribed.length === 0) {
      return
    }

    const ids = unsubscribed.map((draft) => draft.id)

    getPushSubscription(publicKey)
      .then((subscription) =>
        Promise.allSettled(
          ids.map((id) =>
            v1Api.post(`websites/${id}/subscriptions`, subscription.toJSON())
          )
        )
      )
      .then(() => markPushSubscribed(ids))
      .catch(() => {})
  }, [permission, unsubscribed, markPushSubscribed])
}
