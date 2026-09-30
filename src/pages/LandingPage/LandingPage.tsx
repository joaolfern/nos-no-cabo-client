import clsx from 'clsx'
import { MdAdd, MdHome } from 'react-icons/md'
import styles from './LandingPage.module.scss'
import { Typography } from '@/components/Typography/Typography'
import { BubblyContainer } from './components/BubblyContainer/BubblyContainer'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { MOCK_BUBBLE_ITEMS } from './mocks'
import { LANDING_THEME } from './landingTheme'
import { useTheme } from '@/hooks/useTheme'

export function LandingPage() {
  const { mode } = useTheme()

  return (
    <div className={styles.root} style={LANDING_THEME[mode]}>
      <BubblyContainer items={MOCK_BUBBLE_ITEMS} />
      <div className={styles.landingPage}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <Typography variant='titleLg' color='primary'>
              Nós no Cabo
            </Typography>
            <p>
              <Typography variant='titleSm' color='tint'>
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
    </div>
  )
}
