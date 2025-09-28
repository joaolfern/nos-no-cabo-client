import { Typography } from '@/components/Typography/Typography'
import type { TypographyProps } from '@/components/Typography/TypographyTypes'
import { Input } from '@/components/Input/Input'
import { Editable } from '@/components/Editable/Editable'
import { useEditable } from '@/components/Editable/useEditable'
import styles from './EditableText.module.scss'
import clsx from 'clsx'

type EditableTextProps<T> = Partial<TypographyProps> & {
  onSave: (value: T) => void
  value: T
}

export function EditableText<T extends string | undefined>({
  onSave,
  value,
  className,
  ...props
}: EditableTextProps<T>) {
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
          className={clsx(styles.typography, className)}
          variant='body'
          {...props}
        >
          {value || '-'}
        </Typography>
      }
      edit={
        <Input
          autoFocus={true}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value as T)}
        />
      }
    />
  )
}
