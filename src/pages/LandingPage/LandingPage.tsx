import { useSpring } from '@react-spring/web'
import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { MdHome } from 'react-icons/md'
import { useNavigate } from 'react-router'
import styles from './LandingPage.module.scss'
import { useTheme } from '@/hooks/useTheme'
import { Typography } from '@/components/Typography/Typography'
import { BubblyContainer } from './components/BubblyContainer/BubblyContainer'

const MOCK_BUBBLE_ITEMS = [
  {
    id: '1',
    title: 'Portfolio',
    url: '/portfolio',
    imageSrc: 'https://picsum.photos/seed/portfolio/100/100',
  },
  {
    id: '2',
    title: 'About Us',
    url: '/about',
    imageSrc: 'https://picsum.photos/seed/about/100/100',
  },
  {
    id: '3',
    title: 'Services',
    url: '/services',
    imageSrc: 'https://picsum.photos/seed/services/100/100',
  },
  {
    id: '4',
    title: 'Contact',
    url: '/contact',
    imageSrc: 'https://picsum.photos/seed/contact/100/100',
  },
  {
    id: '5',
    title: 'Blog',
    url: '/blog',
    imageSrc: 'https://picsum.photos/seed/blog/100/100',
  },
  {
    id: '6',
    title: 'Careers',
    url: '/careers',
    imageSrc: 'https://picsum.photos/seed/careers/100/100',
  },
  {
    id: '7',
    title: 'FAQ',
    url: '/faq',
    imageSrc: 'https://picsum.photos/seed/faq/100/100',
  },
  {
    id: '8',
    title: 'Support',
    url: '/support',
    imageSrc: 'https://picsum.photos/seed/support/100/100',
  },
  {
    id: '9',
    title: 'Community',
    url: '/community',
    imageSrc: 'https://picsum.photos/seed/community/100/100',
  },
  {
    id: '10',
    title: 'Resources',
    url: '/resources',
    imageSrc: 'https://picsum.photos/seed/resources/100/100',
  },
  {
    id: '11',
    title: 'Case Studies',
    url: '/case-studies',
    imageSrc: 'https://picsum.photos/seed/cases/100/100',
  },
  {
    id: '12',
    title: 'Pricing',
    url: '/pricing',
    imageSrc: 'https://picsum.photos/seed/pricing/100/100',
  },
]

export function LandingPage() {
  const { opacity } = useLoadingBar()
  const navigate = useNavigate()

  function goToWebsites() {
    navigate('/websites')
  }

  return (
    <>
      <BubblyContainer items={MOCK_BUBBLE_ITEMS} />

      <div className={styles.landingPage}>
        <div className={styles.fallbackHeader}>
          <Typography variant='h1' className={styles.staticText}>
            Nós no Cabo
          </Typography>
          <Typography variant='body' className={styles.staticText} asVariant>
            Conectando a comunidade brasileira de tecnologia
          </Typography>
        </div>
        {/* <animated.div
          className={styles.loadingBarContainer}
          style={{ opacity }}
        >
          <LoadingBar />
        </animated.div> */}
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
