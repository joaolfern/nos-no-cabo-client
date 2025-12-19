import { Input } from '@/components/Input/Input'
import { MdArrowBack, MdClose, MdSearch } from 'react-icons/md'
import styles from './Search.module.scss'
import clsx from 'clsx'
import React, { useCallback, useEffect } from 'react'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import type { SearchProps } from '@/components/Search/SearchInterfaces'

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

  function handleBack(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    setIsFocused(false)
  }

  function handleFocus() {
    setIsFocused(true)
  }

  function handleClear(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    if (inputRef.current) {
      inputRef.current.value = ''
      focusInput()
    }
    if (onChange) onChange('')
  }

  function handleEscape(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setIsFocused(false)
      if (inputRef && inputRef.current) inputRef.current.blur()
      if (onChange) onChange('')
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={clsx(styles.content, className, {
          [classNames?.contentFocused || '']: isFocused,
        })}
      >
        <div className={styles.inputContainer} onClick={handleFocus}>
          {isFocused && (
            <ButtonIcon
              label='Close search'
              variant='transparent'
              onClick={handleBack}
              className={styles.backButton}
            >
              <MdArrowBack />
            </ButtonIcon>
          )}
          {!isFocused ? (
            <ButtonIcon
              key='search'
              label='Search'
              className={styles.mainButton}
            >
              <MdSearch />
            </ButtonIcon>
          ) : (
            <ButtonIcon
              key='clear'
              label='Clear'
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
            {...rest}
          />
        </div>
      </div>
    </div>
  )
}
