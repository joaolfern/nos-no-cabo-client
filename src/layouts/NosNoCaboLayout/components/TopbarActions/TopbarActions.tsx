import { MdAdd, MdDarkMode, MdLightMode } from 'react-icons/md'
import { Button } from '@/components/Button/Button'
import { ButtonIcon } from '@/components/ButtonIcon/ButtonIcon'
import { useTheme } from '@/hooks/useTheme'
import { useThemeToggleTransition } from '@/hooks/useThemeToggleTransition'
import { useWebsiteForm } from '@/pages/WebsiteForm/hooks/useWebsiteForm'
import styles from './TopbarActions.module.scss'

export function TopbarActions() {
  const { handleCreate } = useWebsiteForm()
  const { mode } = useTheme()
  const { toggleTheme } = useThemeToggleTransition()
  const isDark = mode === 'dark'

  return (
    <div className={styles.actions}>
      <Button variant='outline' className={styles.add} onClick={handleCreate}>
        <MdAdd size={18} aria-hidden />
        <span className={styles.addLabel}>Adicionar meu site</span>
      </Button>
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
