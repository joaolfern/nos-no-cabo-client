import { useState } from 'react'
import { LuCheck } from 'react-icons/lu'
import { TermsModal } from '@/pages/Terms/components/TermsModal/TermsModal'
import styles from './TermsConsent.module.scss'

type TermsConsentProps = {
  id: string
  accepted: boolean
  onAcceptedChange: (accepted: boolean) => void
  canRemoveLinks: boolean
  onRemoveLinks: () => void
}

export function TermsConsent({
  id,
  accepted,
  onAcceptedChange,
  canRemoveLinks,
  onRemoveLinks,
}: TermsConsentProps) {
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  return (
    <section className={styles.consent} id={id} aria-label='Termos de uso'>
      <p className={styles.text}>
        Anterior, Próximo e Aleatório levam a sites de outras pessoas. Eles
        passam por curadoria automática, mas você pode tirar esses links do
        selo.
        {canRemoveLinks && (
          <>
            {' '}
            <button
              type='button'
              className={styles.textButton}
              onClick={onRemoveLinks}
            >
              Remover links de navegação
            </button>
          </>
        )}
      </p>
      <div className={styles.agreement}>
        <label className={styles.checkbox}>
          <input
            type='checkbox'
            className={styles.input}
            checked={accepted}
            aria-label='Li e concordo com os Termos de uso'
            onChange={(event) => onAcceptedChange(event.target.checked)}
          />
          <span className={styles.box} aria-hidden>
            <LuCheck />
          </span>
          Li e concordo com os
        </label>{' '}
        <button
          type='button'
          className={styles.textButton}
          onClick={() => setIsTermsOpen(true)}
        >
          Termos de uso
        </button>
      </div>
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={() => onAcceptedChange(true)}
      />
    </section>
  )
}
