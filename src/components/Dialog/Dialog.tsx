import type { DialogProps } from '@/components/Dialog/Dialog.types'
import { useEscape } from '@/components/Portal/hooks/useEscape'
import { Portal } from '@/components/Portal/Portal'
import { Typography } from '@/components/Typography/Typography'
import clsx from 'clsx'
import styles from './Dialog.module.scss'
import { Button } from '@/components/Button/Button'

export function Dialog({
  children,
  container,
  isOpen,
  onClose,
  title,
  onCancel,
  onConfirm,
}: DialogProps) {
  useEscape({ isOpen, onClose })

  if (!isOpen) {
    return null
  }

  return (
    <Portal container={container || document.body}>
      <section className={styles.container}>
        <div className={clsx(styles.content)}>
          <Typography variant='h2' className={styles.title}>
            {title}
          </Typography>
          {children}
          <footer className={styles.footer}>
            <Button
              variant='secondary'
              className={styles.button}
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button className={styles.button} onClick={onConfirm}>
              Confirmar
            </Button>
          </footer>
        </div>
        <div className={styles.backdrop} onClick={onClose} />
      </section>
    </Portal>
  )
}
