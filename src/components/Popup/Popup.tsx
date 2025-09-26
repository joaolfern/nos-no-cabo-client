import clsx from 'clsx'
import React from 'react'
import type { PopupProps, PanelProps } from '@/components/Popup/PopupInterfaces'
import { Portal } from '@/components/Portal/Portal'
import { useDismissOnScroll } from '@/components/Dropdown/hooks/useDismissOnScroll'
import { useClickOutside } from '@/components/Dropdown/hooks/useClickOutside'
import styles from './Popup.module.scss'

export function Popup({
  container,
  children,
  position = 'left',
  classNames,
  className,
  popupRef,
  isOpen,
  setIsOpen,
  toggle,
  ...props
}: PopupProps) {
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  const onDismiss = React.useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  function handleToggle() {
    toggle()
  }

  useDismissOnScroll({ onDismiss, isOpen, panelRef })
  useClickOutside({
    isOpen,
    onDismiss,
    panelRef,
    triggerRef,
  })

  return (
    <div className={clsx(className)}>
      <div
        className={clsx(styles.trigger, classNames?.trigger)}
        onClick={handleToggle}
        ref={triggerRef}
      >
        {children}
      </div>
      <Portal container={container || triggerRef.current}>
        <Panel
          {...props}
          className={classNames?.panel}
          ref={panelRef}
          isOpen={isOpen}
          position={position}
        />
      </Portal>
    </div>
  )
}

function Panel({
  className,
  isOpen,
  position = 'left',
  popup,
  ...props
}: PanelProps) {
  return (
    isOpen && (
      <div
        className={clsx(
          styles.panel,
          {
            [styles.left]: position === 'left',
            [styles.right]: position === 'right',
            [styles.topLeft]: position === 'topLeft',
          },
          className
        )}
        {...props}
      >
        {popup}
      </div>
    )
  )
}
