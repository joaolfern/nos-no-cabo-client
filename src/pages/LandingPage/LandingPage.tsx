import { LoadingBar } from '@/components/LoadingBar/LoadingBar'
import { useSpring, animated } from '@react-spring/web'
import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { MdHome } from 'react-icons/md'
import { useNavigate } from 'react-router'
import styles from './LandingPage.module.scss'
import { Scene } from '@/components/Scene/Scene'
import { useTheme } from '@/hooks/useTheme'
import { Typography } from '@/components/Typography/Typography'

export function LandingPage() {
  const { opacity } = useLoadingBar()
  const navigate = useNavigate()
  const { mode, animationsEnabled } = useTheme()

  function goToWebsites() {
    navigate('/websites')
  }

  return (
    <>
      <div className={styles.landingPage}>
        {!animationsEnabled && (
          <div className={styles.fallbackHeader}>
            <Typography variant='h1' className={styles.staticText}>
              Nós no Cabo
            </Typography>
            <Typography variant='body' className={styles.staticText} asVariant>
              Conectando a comunidade brasileira de tecnologia
            </Typography>
          </div>
        )}
        <animated.div
          className={styles.loadingBarContainer}
          style={{ opacity }}
        >
          <LoadingBar />
        </animated.div>
        <Scene
          fallbackBackground='var(--color-background-400)'
          fallbackAccent='var(--color-primary-400)'
          height='100vh'
          width='100vw'
          jsonFilePath={`/unicornStudio/${mode}/landingPageScene.json`}
        />
      </div>
      <FloatingButton
        padded={true}
        variant={'secondary'}
        onClick={goToWebsites}
      >
        <MdHome />
        Conferir sites
      </FloatingButton>
    </>
  )
}

function useLoadingBar() {
  const { animationsEnabled } = useTheme()
  const { opacity } = useSpring({
    from: { opacity: animationsEnabled ? 1 : 0 },
    to: { opacity: 0 },
    delay: 1900,
  })

  return {
    opacity,
  }
}
