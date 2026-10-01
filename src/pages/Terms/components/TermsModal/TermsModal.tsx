import { Button } from '@/components/Button/Button'
import { Modal } from '@/components/Modal/Modal'
import { Typography } from '@/components/Typography/Typography'
import { TermsContent } from '@/pages/Terms/components/TermsContent/TermsContent'
import { TERMS_VERSION_LABEL } from '@/pages/Terms/utils/terms'
import styles from './TermsModal.module.scss'

type TermsModalProps = {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  function accept() {
    onAccept()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className={styles.dialog}
        role='dialog'
        aria-modal='true'
        aria-labelledby='terms-modal-title'
      >
        <header className={styles.header}>
          <Typography as='h2' variant='titleSm' id='terms-modal-title'>
            Termos de uso
          </Typography>
          <Typography as='p' variant='bodySm' color='muted'>
            Versão de {TERMS_VERSION_LABEL}
          </Typography>
        </header>
        <div className={styles.body}>
          <TermsContent />
        </div>
        <footer className={styles.footer}>
          <Button type='button' variant='outline' onClick={onClose}>
            Fechar
          </Button>
          <Button type='button' onClick={accept}>
            Li e concordo
          </Button>
        </footer>
      </div>
    </Modal>
  )
}
