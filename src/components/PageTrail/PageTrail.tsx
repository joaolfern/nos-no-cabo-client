import { Fragment, type ReactNode } from 'react'
import { LuArrowLeft } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { Typography } from '@/components/Typography/Typography'
import styles from './PageTrail.module.scss'

export type Crumb = { label: ReactNode; to?: string }

type PageTrailProps = {
  backTo: string
  crumbs: Crumb[]
}

export function PageTrail({ backTo, crumbs }: PageTrailProps) {
  return (
    <div className={styles.trail}>
      <Button
        asChild={true}
        variant='outline'
        small={true}
        className={styles.back}
      >
        <Link to={backTo}>
          <LuArrowLeft size='1rem' />
          Voltar
        </Link>
      </Button>
      <Typography
        as='nav'
        variant='bodySm'
        color='muted'
        className={styles.breadcrumb}
        aria-label='Trilha de navegação'
      >
        {crumbs.map(({ label, to }, index) => {
          const isCurrent = index === crumbs.length - 1

          return (
            <Fragment key={index}>
              {index > 0 && <span aria-hidden>/</span>}
              {to && !isCurrent ? (
                <Link to={to}>{label}</Link>
              ) : (
                <span
                  className={isCurrent ? styles.current : undefined}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {label}
                </span>
              )}
            </Fragment>
          )
        })}
      </Typography>
    </div>
  )
}
