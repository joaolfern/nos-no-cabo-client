import clsx from 'clsx'
import { LuChevronLeft, LuChevronRight, LuShuffle } from 'react-icons/lu'
import { Link } from '@/components/Link/Link'
import { useAdjacentWebsites } from '@/pages/Website/hooks/useAdjacentWebsites'
import { useWebsiteStats } from '@/pages/Website/hooks/useWebsiteStats'
import { buildWebsiteMetrics } from '@/pages/Website/utils/websiteMetrics'
import type { IWebsite } from '@/interfaces/IWebsite'
import styles from './WebsiteMetrics.module.scss'

const COUNTER_DIGITS = 6

interface WebsiteMetricsProps {
  website: IWebsite
}

export function WebsiteMetrics({ website }: WebsiteMetricsProps) {
  const { data: stats } = useWebsiteStats(website.id)
  const metrics = buildWebsiteMetrics(stats)
  const { previous, next, random, isLoading } = useAdjacentWebsites(website.id)

  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {metrics.map((metric) => (
          <div key={metric.id} className={styles.metric}>
            {metric.value === undefined ? (
              <span
                className={clsx(styles.value, styles.valueBone)}
                aria-hidden={true}
              >
                000
              </span>
            ) : metric.value === null ? (
              <span className={styles.value}>–</span>
            ) : metric.display === 'counter' ? (
              <VisitCounter value={metric.value} />
            ) : (
              <span className={styles.value}>
                {metric.value.toLocaleString('pt-BR')}
              </span>
            )}
            <span className={styles.description}>{metric.description}</span>
          </div>
        ))}
      </div>

      <nav className={styles.nav}>
        {previous ? (
          <Link
            to={`/website/${previous.id}`}
            className={clsx(styles.navLink, styles.navPrevious)}
            title={previous.name}
          >
            <LuChevronLeft size='1rem' />
            <span className={styles.navMuted}>Anterior:</span>
            <span className={styles.navName}>{previous.name}</span>
          </Link>
        ) : (
          <NavPlaceholder
            className={styles.navPrevious}
            isLoading={isLoading}
          />
        )}

        {random ? (
          <Link
            to={`/website/${random.id}`}
            className={clsx(styles.navLink, styles.navAccent)}
          >
            <LuShuffle size='1rem' />
            Site aleatório
          </Link>
        ) : (
          <NavPlaceholder isLoading={isLoading} />
        )}

        {next ? (
          <Link
            to={`/website/${next.id}`}
            className={clsx(styles.navLink, styles.navNext)}
            title={next.name}
          >
            <span className={styles.navMuted}>Próximo:</span>
            <span className={styles.navName}>{next.name}</span>
            <LuChevronRight size='1rem' />
          </Link>
        ) : (
          <NavPlaceholder className={styles.navNext} isLoading={isLoading} />
        )}
      </nav>
    </section>
  )
}

// Same box as a nav link, so the row keeps its height while loading and when a slot is empty.
function NavPlaceholder({
  className,
  isLoading,
}: {
  className?: string
  isLoading: boolean
}) {
  return (
    <span
      className={clsx(styles.navLink, styles.navPlaceholder, className, {
        [styles.navHidden]: !isLoading,
      })}
      aria-hidden={true}
    >
      <span className={styles.navBone}>Carregando vizinho</span>
    </span>
  )
}

function VisitCounter({ value }: { value: number }) {
  const digits = String(value).padStart(COUNTER_DIGITS, '0').split('')

  return (
    <span
      className={styles.counter}
      role='img'
      aria-label={value.toLocaleString('pt-BR')}
    >
      {digits.map((digit, index) => (
        <span key={index} className={styles.digit} aria-hidden={true}>
          {digit}
        </span>
      ))}
    </span>
  )
}
