import { Image } from '@/components/Image/Image'
import { Typography } from '@/components/Typography/Typography'
import { formatDate } from '@/utils/formatDate/formatDate'
import styles from './WebsiteAuthorAndDate.module.scss'
import { getLastName } from '@/utils/getLastName/getLastName'
import type { IWebsite } from '@/interfaces/IWebsite'

type ContentProps = Pick<IWebsite, 'createdAt'> & {
  authorName: string
}

type DetailedProps = ContentProps & {
  authorImage: string
}

export function WebsiteAuthorAndDate() {}

WebsiteAuthorAndDate.Compact = function Compact({
  authorName,
  createdAt,
}: ContentProps) {
  return (
    <div>
      <Typography className={styles.compact} variant='caption' secondary={true}>
        <LastName aria-label='Written by' lastName={authorName} />
        <Date date={createdAt} />
      </Typography>
    </div>
  )
}
WebsiteAuthorAndDate.Detailed = function Detailed({
  authorName,
  createdAt,
  authorImage,
}: DetailedProps) {
  return (
    <div className={styles.detailed}>
      <Image src={authorImage} avatar={true} />
      <div className={styles.textContent}>
        <Typography variant='caption'>
          Written by: <LastName lastName={authorName} />
        </Typography>
        <Typography variant='caption' secondary={true}>
          <Date date={createdAt} />
        </Typography>
      </div>
    </div>
  )
}

interface DateProps {
  date: string
}

function Date({ date }: DateProps) {
  return <time dateTime={date}>{formatDate(date, 'short')}</time>
}

interface LastNameProps {
  lastName: string
}

function LastName({ lastName }: LastNameProps) {
  return <span>{getLastName(lastName)}</span>
}
