import clsx from 'clsx'
import { type ReactNode } from 'react'
import { MdCheck, MdClose, MdEdit } from 'react-icons/md'
import styles from './Editable.module.scss'

type EditableProps<T> = {
  display: ReactNode
  edit: ReactNode
  isEditing: boolean
  onSave: (value: T) => void
  onEdit: (open?: false) => void
  currentValue: T
}

export function Editable<T>({
  display,
  edit,
  currentValue,
  isEditing,
  onEdit,
  onSave,
}: EditableProps<T>) {
  if (isEditing) {
    return (
      <Container>
        {edit}
        <button
          className={styles.icon}
          title='Cancelar'
          aria-label='Cancelar'
          onClick={() => onEdit(false)}
        >
          <MdClose />
        </button>
        <button
          className={styles.icon}
          title='Salvar'
          aria-label='Salvar'
          onClick={() => onSave(currentValue)}
        >
          <MdCheck />
        </button>
      </Container>
    )
  }

  return (
    <Container>
      {display}
      <button
        className={clsx(styles.icon, styles.editButton)}
        title='Editar'
        aria-label='Editar'
        onClick={() => onEdit()}
      >
        <MdEdit size={20} />
      </button>
    </Container>
  )
}

type ContainerProps = React.JSX.IntrinsicElements['div']

function Container({ className, ...props }: ContainerProps) {
  return <div className={clsx(styles.container, className)} {...props} />
}
