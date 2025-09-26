import { Typography } from '@/components/Typography/Typography'
import type { TypographyProps } from '@/components/Typography/TypographyTypes'
import { Input } from '@/components/Input/Input'
import { Editable } from '@/components/Editable/Editable'
import { useEditable } from '@/components/Editable/useEditable'
import clsx from 'clsx'
import styles from './EditableColor.module.scss'

type EditableColorProps<T> = Partial<TypographyProps> & {
  onSave: (value: T) => void
  value: T
}

export function EditableColor<T extends string | undefined>({
  onSave,
  value,
  className,
  ...props
}: EditableColorProps<T>) {
  const { currentValue, setCurrentValue, isEditing, setIsEditing } =
    useEditable({ value })

  return (
    <Editable
      currentValue={currentValue}
      isEditing={isEditing}
      onEdit={(value) => setIsEditing(value)}
      onSave={(val) => {
        onSave(val)
        setIsEditing(false)
      }}
      display={
        <Typography
          variant='body'
          className={clsx(styles.typography, className)}
          style={{ color: value }}
          strong={true}
          {...props}
        >
          {value}
        </Typography>
      }
      edit={
        <Input
          autoFocus={true}
          style={{ color: currentValue }}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value as T)}
        />
      }
    />
  )
}
