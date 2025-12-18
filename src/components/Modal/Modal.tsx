import type { ModalProps } from '@/components/Modal/Modal.types'
import { createPortal } from 'react-dom'
import { Typography } from '@/components/Typography/Typography'
import clsx from 'clsx'
import { Button } from '@/components/Button/Button'
import styles from './Modal.module.scss'
import type { ButtonProps } from '@/components/Button/Button.types'
import { useEscape } from '@/components/Portal/hooks/useEscape'

export function Modal({
  children,
  container,
  isOpen,
  onClose,
  title,
  variant = 'default',
}: ModalProps) {
  useEscape({ isOpen, onClose })

  if (!isOpen) {
    return null
  }

  return createPortal(
    <section className={styles.container}>
      <div className={clsx(styles.content, CONTENT_STYLE_VARIANT[variant])}>
        <Typography variant='h2' className={styles.title}>
          {title}
        </Typography>
        {children}
      </div>
      <div className={styles.backdrop} onClick={onClose} />
    </section>,
    container || document.body
  )
}

type FooterProps = React.JSX.IntrinsicElements['footer']

Modal.Footer = ModalFooter

function ModalFooter({ className, ...props }: FooterProps) {
  return <footer className={clsx(className, styles.footer)} {...props} />
}

Modal.Button = ModalButton

function ModalButton({ className, ...props }: ButtonProps) {
  return <Button className={clsx(className, styles.button)} {...props} />
}

const CONTENT_STYLE_VARIANT = {
  default: styles.contentDefault,
  message: styles.contentMessage,
}
