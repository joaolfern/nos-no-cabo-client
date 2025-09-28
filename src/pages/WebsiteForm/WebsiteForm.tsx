import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { Popup } from '@/components/Popup/Popup'
import { MdAdd, MdClose } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import type { IPreregisterWebsite } from '@/interfaces/IWebsite'
import { InitialStep } from '@/pages/WebsiteForm/components/InitialStep/InitialStep'
import { PreregisterStep } from '@/pages/WebsiteForm/components/PreregisterStep/PreregisterStep'
import { ReviewStep } from '@/pages/WebsiteForm/components/ReviewStep/ReviewStep'
import styles from './WebsiteForm.module.scss'
import { KeywordsStep } from '@/pages/WebsiteForm/components/KeywordsStep/KeywordsStep'

export function WebsiteForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [preregister, setPreregister] = useState<IPreregisterWebsite | null>(
    null
  )
  const [hasCreatedWebsite, setHasCreatedWebsite] = useState(false)
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
    setHasCreatedWebsite(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setHasCreatedWebsite(false)
    }, 4000)
  }

  return (
    <div className={styles.container}>
      <Popup
        position='topLeft'
        popup={
          CurrentStep && (
            <CurrentStep
              preregister={preregister}
              setPreregister={setPreregister}
              updateStep={setStepIndex}
              onSuccess={onSucess}
            />
          )
        }
        classNames={{ panel: styles.popup }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        toggle={() => setIsOpen((prev) => !prev)}
      >
        <FloatingButton
          className={styles.button}
          variant={isOpen ? 'secondary' : 'primary'}
        >
          {isOpen ? (
            <>
              Cancelar
              <MdClose />
            </>
          ) : hasCreatedWebsite ? (
            'Seu site foi adicionado! 🎉🎉'
          ) : (
            <>
              Adicionar meu site
              <MdAdd />
            </>
          )}
        </FloatingButton>
      </Popup>
    </div>
  )
}

const STEPS = [InitialStep, PreregisterStep, ReviewStep, KeywordsStep]
