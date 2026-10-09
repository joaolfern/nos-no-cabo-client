import clsx from 'clsx'
import type { ReactNode } from 'react'
import { MdAdd, MdHome } from 'react-icons/md'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { Typography } from '@/components/Typography/Typography'
import { useTheme } from '@/hooks/useTheme'
import { SiteFooter } from '@/layouts/NosNoCaboLayout/components/SiteFooter/SiteFooter'
import { LANDING_THEME } from '@/pages/LandingPage/landingTheme'
import styles from '@/pages/LandingPage/LandingPage.module.scss'

type LandingShellProps = {
  background?: ReactNode
}

// Everything on the landing page but the animated bubbles, which the page passes as its background.
export function LandingShell({ background }: LandingShellProps) {
  const { mode } = useTheme()

  return (
    <div className={styles.root} style={LANDING_THEME[mode]}>
      {background}
      <div className={styles.landingPage}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <Typography variant='titleLg' color='primary'>
              Nós no Cabo
            </Typography>
            <p>
              <Typography
                variant='titleSm'
                color={mode === 'light' ? 'muted' : 'tint'}
              >
                Conectando a comunidade brasileira
                <br /> de tecnologia
              </Typography>
            </p>
          </div>
          <div className={styles.buttonGroup}>
            <Button className={styles.button} asChild>
              <Link to='/websites'>
                <MdHome />
                Conferir sites
              </Link>
            </Button>
            <Button
              variant='secondary'
              className={clsx(styles.button, styles.secondaryButton)}
              asChild
            >
              <Link to='/websites/novo'>
                <MdAdd />
                Adicionar um site
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <SiteFooter className={styles.footer} />
    </div>
  )
}
