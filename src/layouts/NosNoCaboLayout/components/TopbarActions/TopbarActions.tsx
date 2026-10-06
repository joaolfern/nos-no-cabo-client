import type { ReactNode } from 'react'
import { MdAdd, MdBrightness4, MdDarkMode, MdLightMode } from 'react-icons/md'
import { Button } from '@/components/Button/Button'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import { useTheme } from '@/hooks/useTheme'
import { useThemeToggleTransition } from '@/hooks/useThemeToggleTransition'
import { Link } from '@/components/Link/Link'
import type { ThemeModes } from '@/interfaces/ITheme'
import styles from './TopbarActions.module.scss'

// The icon shows the current theme; the label says what a click switches to.
const THEME_ICON: Record<ThemeModes, ReactNode> = {
  dark: <MdDarkMode size={20} />,
  dimmed: <MdBrightness4 size={20} />,
  light: <MdLightMode size={20} />,
}

const SWITCH_LABEL: Record<ThemeModes, string> = {
  dark: 'Usar tema escuro',
  dimmed: 'Usar tema suave',
  light: 'Usar tema claro',
}

type TopbarActionsProps = {
  showAddSite?: boolean
}

export function TopbarActions({ showAddSite = true }: TopbarActionsProps) {
  const { mode, nextMode } = useTheme()
  const { toggleTheme } = useThemeToggleTransition()

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
        label={SWITCH_LABEL[nextMode]}
        className={styles.themeToggle}
        onClick={toggleTheme}
      >
        {THEME_ICON[mode]}
      </ButtonIcon>
    </div>
  )
}
