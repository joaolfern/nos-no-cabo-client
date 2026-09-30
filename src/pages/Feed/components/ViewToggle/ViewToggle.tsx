import { LuLayoutGrid, LuList } from 'react-icons/lu'
import clsx from 'clsx'
import type { IconType } from 'react-icons'
import type { FeedView } from '@/interfaces/IFeedView'
import styles from './ViewToggle.module.scss'

type ViewToggleProps = {
  value: FeedView
  onChange: (view: FeedView) => void
}

const OPTIONS: { view: FeedView; label: string; Icon: IconType }[] = [
  { view: 'grid', label: 'Ver em grade', Icon: LuLayoutGrid },
  { view: 'list', label: 'Ver em lista', Icon: LuList },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role='group'
      aria-label='Modo de visualização'
      className={styles.group}
    >
      {OPTIONS.map(({ view, label, Icon }) => (
        <button
          key={view}
          type='button'
          className={clsx(styles.option, {
            [styles.active]: value === view,
          })}
          aria-pressed={value === view}
          aria-label={label}
          title={label}
          onClick={() => onChange(view)}
        >
          <Icon size='1rem' />
        </button>
      ))}
    </div>
  )
}
