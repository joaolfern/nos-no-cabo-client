import type { InputProps } from '@/components/Input/_InputProps'
import { Input } from '@/components/Input/Input'
import { MdClose } from 'react-icons/md'
import styles from './InputList.module.scss'
import clsx from 'clsx'

type InputListProps<T> = Omit<InputProps, 'value' | 'onChange'> & {
  value: T[]
  onChange: (value: T[]) => void
}

export function InputList<T extends string | undefined>({
  value,
  onChange,
  className,
  ...props
}: InputListProps<T>) {
  const items = value.length > 0 ? value : ['' as T]

  function handleRemove(idx: number) {
    const newValue = value.filter((_, i) => i !== idx)
    onChange(newValue)
  }

  function handleAdd() {
    onChange([...value, '' as T])
  }

  const handleOnChange: (i: number) => InputProps['onChange'] = (i) => (e) => {
    const newValue = [...value]
    newValue[i] = e.target.value as T
    onChange(newValue as T[])
  }

  return (
    <div className={styles.list}>
      {items.map((val, i) => (
        <div className={styles.inputContainer} key={i}>
          <Input
            {...props}
            autoFocus={true}
            className={clsx(className, styles.input)}
            value={val}
            onChange={(e) => {
              handleOnChange(i)?.(e)
            }}
          />
          <button
            title='Remover'
            aria-label='Remover'
            type='button'
            onClick={() => handleRemove(i)}
          >
            <MdClose />
          </button>
        </div>
      ))}
      <button type='button' onClick={handleAdd}>
        Adicionar
      </button>
    </div>
  )
}
