import { Input } from '@/components/Input/Input'
import { MdClose, MdSearch } from 'react-icons/md'
import styles from './Search.module.scss'
import clsx from 'clsx'
import React, { useCallback, useEffect } from 'react'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import type { SearchProps } from '@/components/Search/SearchInterfaces'
import { Typography } from '../Typography/Typography'

export function Search({
  className,
  classNames,
  onChange,
  value,
  options,
  container,
  ...rest
}: SearchProps) {
  const [isFocused, setIsFocused] = React.useState(Boolean(value))
  const inputRef = React.useRef<HTMLInputElement>(null)
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (isFocused) {
      focusInput()
    }
  }, [isFocused, focusInput])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  function handleFocus() {
    setIsFocused(true)
  }

  // Phones show the field only while open, so closing has to be reachable without a keyboard.
  function close() {
    setIsFocused(false)
    inputRef.current?.blur()
    onChange?.('')
  }

  function handleClear(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    close()
  }

  function handleEscape(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') close()
  }

  function handleBlur() {
    if (!inputRef.current?.value) setIsFocused(false)
  }

  return (
    <div className={styles.container}>
      <div
        className={clsx(styles.content, className, {
          [classNames?.contentFocused || '']: isFocused,
        })}
      >
        <div className={styles.inputContainer} onClick={handleFocus}>
          <Typography className={styles.searchIcon} color='subtle'>
            <MdSearch key='search' />
          </Typography>

          {!isFocused ? (
            <></>
          ) : (
            <ButtonIcon
              key='clear'
              label='Fechar busca'
              className={styles.mainButton}
              onClick={handleClear}
              variant='transparent'
              secondary={true}
            >
              <MdClose />
            </ButtonIcon>
          )}
          <Input
            value={value}
            ref={inputRef}
            className={clsx(styles.input, {
              [styles.inputVisible]: isFocused,
            })}
            onChange={handleChange}
            onKeyDown={handleEscape}
            onBlur={handleBlur}
            {...rest}
          />
        </div>
      </div>
    </div>
  )
}
