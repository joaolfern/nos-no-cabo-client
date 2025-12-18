import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { MdAdd } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import type { IPreregisterWebsite } from '@/interfaces/IWebsite'
import { InitialStep } from '@/pages/WebsiteForm/components/InitialStep/InitialStep'
import { PreregisterStep } from '@/pages/WebsiteForm/components/PreregisterStep/PreregisterStep'
import { ReviewStep } from '@/pages/WebsiteForm/components/ReviewStep/ReviewStep'
import styles from './WebsiteForm.module.scss'
import { KeywordsStep } from '@/pages/WebsiteForm/components/KeywordsStep/KeywordsStep'
import { GithubStep } from '@/pages/WebsiteForm/components/GithubStep/GithubStep'
import { Modal } from '@/components/Modal/Modal'

export function WebsiteForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [preregister, setPreregister] = useState<IPreregisterWebsite | null>(
    null
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const CurrentStep = STEPS[stepIndex]
  const isClosed = !isOpen

  useEffect(() => {
    if (isClosed) {
      setStepIndex(0)
    }
  }, [isClosed])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function onSucess() {
    setIsOpen(false)
    setPreregister(null)
    setStepIndex(0)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {}, 4000)
  }

  function handleClose() {
    setIsOpen(false)
  }

  return (
    <div className={styles.container}>
      <Modal onClose={handleClose} isOpen={isOpen}>
        {CurrentStep && (
          <CurrentStep
            preregister={preregister}
            setPreregister={setPreregister}
            updateStep={setStepIndex}
            onSuccess={onSucess}
          />
        )}
      </Modal>
      <FloatingButton
        className={styles.button}
        variant={isOpen ? 'secondary' : 'primary'}
        onClick={() => setIsOpen(true)}
      >
        Adicionar meu site
        <MdAdd />
      </FloatingButton>
    </div>
  )
}

const STEPS = [
  InitialStep,
  PreregisterStep,
  ReviewStep,
  GithubStep,
  KeywordsStep,
]
