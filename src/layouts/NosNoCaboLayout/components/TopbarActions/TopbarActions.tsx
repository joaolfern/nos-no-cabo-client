import { MdAdd, MdDarkMode, MdLightMode } from 'react-icons/md'
import { Button } from '@/components/Button/Button'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import { useTheme } from '@/hooks/useTheme'
import { useThemeToggleTransition } from '@/hooks/useThemeToggleTransition'
import { Link } from '@/components/Link/Link'
import styles from './TopbarActions.module.scss'

type TopbarActionsProps = {
  showAddSite?: boolean
}

export function TopbarActions({ showAddSite = true }: TopbarActionsProps) {
  const { mode } = useTheme()
  const { toggleTheme } = useThemeToggleTransition()
  const isDark = mode === 'dark'

  return (
    <div className={styles.actions}>
      {showAddSite && (
        <Button variant='outline' className={styles.add} asChild>
          <Link to='/websites/novo' aria-label='Adicionar um site'>
            <MdAdd size={18} aria-hidden />
            <span className={styles.addLabel}>Adicionar um site</span>
          </Link>
        </Button>
      )}
      <ButtonIcon
        variant='transparent'
        label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
        className={styles.themeToggle}
        onClick={toggleTheme}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </ButtonIcon>
    </div>
  )
}
