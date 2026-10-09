import clsx from 'clsx'
import { Fragment } from 'react'
import { TermsHeader } from '@/pages/Terms/components/TermsHeader/TermsHeader'
import { TermsTrail } from '@/pages/Terms/components/TermsTrail/TermsTrail'
import pageStyles from '@/pages/Terms/Terms.module.scss'
import contentStyles from '@/pages/Terms/components/TermsContent/TermsContent.module.scss'
import styles from './TermsSkeleton.module.scss'

// A paragraph's line count, or a list's line count per item.
type Block = number | number[]

// Line counts of each terms section at the desktop column width (46rem).
const SECTION_LINES: Block[][] = [
  [2],
  [2],
  [2],
  [2, [1, 1, 3, 1, 1], 2],
  [4],
  [1, [1, 2, 2, 1, 1], 1],
  [1, [1, 1, 1, 1]],
  [4],
  [1, [1, 1, 2], 3],
  [2],
  [2],
  [2],
]

function BoneLines({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      &nbsp;
    </Fragment>
  ))
}

function SectionSkeleton({ blocks }: { blocks: Block[] }) {
  return (
    <section>
      <h2 className={styles.heading}>&nbsp;</h2>
      {blocks.map((block, index) =>
        typeof block === 'number' ? (
          <p key={index} className={styles.bone}>
            <BoneLines count={block} />
          </p>
        ) : (
          <ul key={index}>
            {block.map((lines, item) => (
              <li key={item} className={styles.bone}>
                <BoneLines count={lines} />
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

export function TermsSkeleton() {
  return (
    <div
      className={pageStyles.page}
      role='status'
      aria-label='Carregando termos de uso'
    >
      <TermsTrail />
      <article className={pageStyles.article}>
        <TermsHeader />
        <div className={contentStyles.terms} aria-hidden={true}>
          {SECTION_LINES.map((blocks, index) => (
            <SectionSkeleton key={index} blocks={blocks} />
          ))}
          <p className={clsx(styles.bone, styles.contact)}>&nbsp;</p>
        </div>
      </article>
    </div>
  )
}
