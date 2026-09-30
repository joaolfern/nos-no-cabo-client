import { useState } from 'react'
import type { ISubmittedWebsite } from '@/interfaces/IWebsite'
import { SubmitForm } from '@/pages/SubmitWebsite/components/SubmitForm/SubmitForm'
import { SubmitSuccess } from '@/pages/SubmitWebsite/components/SubmitSuccess/SubmitSuccess'
import styles from './SubmitWebsite.module.scss'

export function SubmitWebsite() {
  const [submitted, setSubmitted] = useState<ISubmittedWebsite | null>(null)

  return (
    <div className={styles.page}>
      {submitted ? (
        <SubmitSuccess
          website={submitted}
          onSubmitAnother={() => setSubmitted(null)}
        />
      ) : (
        <SubmitForm onSubmitted={setSubmitted} />
      )}
    </div>
  )
}
