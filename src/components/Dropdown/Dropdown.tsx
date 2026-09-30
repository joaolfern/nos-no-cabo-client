import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { LuCheck } from 'react-icons/lu'
import { Loading } from '@/components/Loading/Loading'
import { Portal } from '@/components/Portal/Portal'
import type {
  DropdownOption,
  DropdownProps,
} from '@/components/Dropdown/DropdownInterfaces'
import { useAnchoredPosition } from '@/components/Dropdown/hooks/useAnchoredPosition'
import { useClickOutside } from '@/components/Dropdown/hooks/useClickOutside'
import { useDismissOnScroll } from '@/components/Dropdown/hooks/useDismissOnScroll'
import styles from './Dropdown.module.scss'

const TRIGGER_CONTROL = 'button, a[href], input, [tabindex]'

export function Dropdown<T, M extends boolean | undefined>({
  children,
  options,
  value,
  onChange,
  multiple: _multiple,
  position = 'left',
  loading = false,
  classNames,
  className,
  ...props
}: DropdownProps<T, M>) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()
  const panelStyle = useAnchoredPosition({
    triggerRef,
    panelRef,
    isOpen,
    position,
  })

  const close = useCallback(() => setIsOpen(false), [])

  const closeAndFocusTrigger = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.querySelector<HTMLElement>(TRIGGER_CONTROL)?.focus()
  }, [])

  useDismissOnScroll({ onDismiss: close, isOpen, panelRef })
  useClickOutside({ isOpen, onDismiss: close, panelRef, triggerRef })

  // The trigger's control is passed in as children, so its ARIA state is set here.
  useEffect(() => {
    const control = triggerRef.current?.querySelector(TRIGGER_CONTROL)
    if (!control) return

    control.setAttribute('aria-haspopup', 'listbox')
    control.setAttribute('aria-expanded', String(isOpen))
    if (isOpen) control.setAttribute('aria-controls', panelId)
    else control.removeAttribute('aria-controls')
  }, [isOpen, panelId])

  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    const initialOption =
      panel?.querySelector<HTMLElement>('[aria-selected="true"]') ??
      panel?.querySelector<HTMLElement>('[role="option"]')
    initialOption?.focus({ preventScroll: true })

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') closeAndFocusTrigger()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeAndFocusTrigger])

  function handleSelect(optionValue: T) {
    closeAndFocusTrigger()
    onChange(optionValue)
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      event.preventDefault()
      closeAndFocusTrigger()
      return
    }

    const items = [
      ...(panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ??
        []),
    ]
    const current = items.indexOf(document.activeElement as HTMLElement)
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: items.length - 1,
    }
    const next = moves[event.key]

    if (next === undefined || items.length === 0) return

    event.preventDefault()
    items[(next + items.length) % items.length].focus()
  }

  return (
    <div className={className}>
      <div
        ref={triggerRef}
        className={clsx(styles.trigger, classNames?.trigger)}
        onClick={() => setIsOpen((open) => !open)}
      >
        {children}
      </div>
      {isOpen && (
        <Portal container={document.body}>
          <div
            {...props}
            ref={panelRef}
            id={panelId}
            role='listbox'
            className={clsx(styles.panel, classNames?.panel)}
            style={panelStyle}
            onKeyDown={handlePanelKeyDown}
          >
            {loading ? (
              <div className={styles.status}>
                <Loading />
              </div>
            ) : options.length === 0 ? (
              <div className={styles.status}>Sem opções</div>
            ) : (
              options.map((option) => (
                <DropdownItem
                  key={option.label}
                  option={option}
                  selected={isSelected(value, option.value)}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
        </Portal>
      )}
    </div>
  )
}

type DropdownItemProps<T> = {
  option: DropdownOption<T>
  selected: boolean
  onSelect: (value: T) => void
}

function DropdownItem<T>({ option, selected, onSelect }: DropdownItemProps<T>) {
  const { Icon } = option

  return (
    <button
      type='button'
      role='option'
      aria-selected={selected}
      tabIndex={-1}
      className={clsx(styles.option, { [styles.selected]: selected })}
      onClick={() => onSelect(option.value)}
    >
      {Icon && <Icon className={styles.optionIcon} aria-hidden={true} />}
      <span className={styles.optionLabel}>{option.label}</span>
      {option.endContent && (
        <span className={styles.optionEnd}>{option.endContent}</span>
      )}
      {selected && <LuCheck className={styles.check} aria-hidden={true} />}
    </button>
  )
}

function isSelected<T>(value: unknown, optionValue: T) {
  return Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue
}
