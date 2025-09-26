import styles from './Dropdown.module.scss'
import clsx from 'clsx'
import React, { useState } from 'react'
import { Menu } from '@/components/Menu/Menu'
import type {
  DropdownProps,
  PanelProps,
} from '@/components/Dropdown/DropdownInterfaces'
import { useDismissOnScroll } from '@/components/Dropdown/hooks/useDismissOnScroll'
import { useClickOutside } from '@/components/Dropdown/hooks/useClickOutside'
import { Portal } from '@/components/Portal/Portal'

export function Dropdown<T, M extends boolean | undefined>({
  container,
  children,
  onChange,
  position = 'left',
  classNames,
  className,
  multiple,
  ...props
}: DropdownProps<T, M>) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  const onDismiss = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  function handleToggle() {
    setIsOpen((prev) => !prev)
  }

  function handleChange(value: T) {
    onDismiss()
    onChange(value)
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
          handleChange={handleChange}
          position={position}
        />
      </Portal>
    </div>
  )
}

function Panel<T, M extends boolean | undefined>({
  options,
  className,
  isOpen,
  handleChange,
  position = 'left',
  value,
  ...props
}: PanelProps<T, M>) {
  const hasOptions = options && options[0]

  return (
    isOpen && (
      <Menu
        role='listbox'
        className={clsx(
          styles.panel,
          {
            [styles.left]: position === 'left',
            [styles.right]: position === 'right',
          },
          className
        )}
        {...props}
      >
        {hasOptions ? (
          options.map((option) => {
            const selected = Array.isArray(value)
              ? value.includes(option.value)
              : value === option.value

            return (
              <PanelItem
                key={option.label}
                option={option}
                selected={selected}
                handleChange={handleChange}
              />
            )
          })
        ) : (
          <Menu.Empty />
        )}
      </Menu>
    )
  )
}

function PanelItem<T>({
  option,
  selected,
  handleChange,
}: {
  option: { label: string; value: T }
  selected: boolean
  handleChange: (value: T) => void
}) {
  return (
    <Menu.Item
      key={option.label}
      onClick={() => handleChange(option.value)}
      selected={selected}
      value={option.value}
    >
      {option.label}
    </Menu.Item>
  )
}
