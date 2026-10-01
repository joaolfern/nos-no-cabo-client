import clsx from 'clsx'
import { WidgetRender } from '@/pages/WidgetEditor/components/WidgetRender/WidgetRender'
import {
  previewTheme,
  type Backdrop,
  type WidgetOptions,
} from '@/pages/WidgetEditor/utils/widgetPresets'
import styles from './PreviewStage.module.scss'

type PreviewStageProps = {
  websiteId: string
  options: WidgetOptions
  backdrop: Backdrop
  onBackdropChange: (backdrop: Backdrop) => void
}

const BACKDROPS: { id: Backdrop; label: string }[] = [
  { id: 'claro', label: 'Site claro' },
  { id: 'escuro', label: 'Site escuro' },
]

export function PreviewStage({
  websiteId,
  options,
  backdrop,
  onBackdropChange,
}: PreviewStageProps) {
  const previewOptions: WidgetOptions = {
    ...options,
    theme: previewTheme(options.theme, backdrop),
  }

  return (
    <section className={styles.stage} aria-label='Prévia num site'>
      <div className={styles.bar}>
        <span>Prévia num site</span>
        <div
          className={styles.segment}
          role='group'
          aria-label='Fundo da prévia'
        >
          {BACKDROPS.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              className={clsx(styles.segmentButton, {
                [styles.active]: backdrop === id,
              })}
              aria-pressed={backdrop === id}
              onClick={() => onBackdropChange(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={clsx(styles.host, styles[backdrop])}>
        <span className={styles.line} style={{ width: '42%' }} />
        <span className={styles.line} style={{ width: '88%' }} />
        <span className={styles.line} style={{ width: '76%' }} />
        <div className={styles.footer}>
          <WidgetRender websiteId={websiteId} options={previewOptions} />
        </div>
      </div>
    </section>
  )
}
