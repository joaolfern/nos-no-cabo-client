import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { WidgetEditorHeader } from '@/pages/WidgetEditor/components/WidgetEditorHeader/WidgetEditorHeader'
import { WidgetEditorTrail } from '@/pages/WidgetEditor/components/WidgetEditorTrail/WidgetEditorTrail'
import {
  DEFAULT_SITE_NAME,
  OPTION_LABELS,
  SHOW_HIDE,
} from '@/pages/WidgetEditor/utils/optionLabels'
import {
  DEFAULT_WIDGET_OPTIONS,
  WIDGET_ACCENTS,
  WIDGET_LOGOS,
  WIDGET_PRESETS,
  WIDGET_THEMES,
  presetDefinition,
} from '@/pages/WidgetEditor/utils/widgetPresets'
import chipStyles from '@/components/ChoiceChip/ChoiceChip.module.scss'
import editorStyles from '@/pages/WidgetEditor/WidgetEditor.module.scss'
import consentStyles from '@/pages/WidgetEditor/components/TermsConsent/TermsConsent.module.scss'
import snippetStyles from '@/pages/WidgetEditor/components/SnippetCode/SnippetCode.module.scss'
import stageStyles from '@/pages/WidgetEditor/components/PreviewStage/PreviewStage.module.scss'
import styles from './WidgetEditorSkeleton.module.scss'

function GroupSkeleton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={editorStyles.group}>
      <span className={clsx(editorStyles.legend, styles.legend)}>{label}</span>
      <div className={editorStyles.choices} aria-hidden={true}>
        {children}
      </div>
    </div>
  )
}

function ChipBones({ labels }: { labels: string[] }) {
  return labels.map((label) => (
    <span key={label} className={clsx(chipStyles.chip, styles.chip)}>
      {label}
    </span>
  ))
}

function OutputSkeleton() {
  return (
    <div className={editorStyles.output} aria-hidden={true}>
      <div className={stageStyles.stage}>
        <div className={stageStyles.bar}>
          <span className={styles.text}>Prévia num site</span>
          <span className={clsx(stageStyles.segment, styles.segment)} />
        </div>
        <span className={styles.host} />
      </div>
      <div className={consentStyles.consent}>
        <p className={clsx(consentStyles.text, styles.text)}>
          &nbsp;
          <br />
          &nbsp;
        </p>
        <span className={clsx(styles.text, styles.agreement)}>&nbsp;</span>
      </div>
      <div className={snippetStyles.code}>
        <span className={styles.snippetBar} />
      </div>
      <p className={clsx(editorStyles.hint, styles.text, styles.hint)}>
        &nbsp;
      </p>
    </div>
  )
}

// The editor while its chunk loads, with the default model's option groups.
export function WidgetEditorSkeleton() {
  const { id: websiteId = '' } = useParams<{ id: string }>()
  const preset = presetDefinition(DEFAULT_WIDGET_OPTIONS.preset)
  const showHide = SHOW_HIDE.map(({ label }) => label)

  return (
    <div
      className={editorStyles.page}
      role='status'
      aria-label='Carregando editor do selo'
    >
      <WidgetEditorTrail websiteId={websiteId} />
      <WidgetEditorHeader siteName={DEFAULT_SITE_NAME} />

      <div className={editorStyles.layout}>
        <div className={editorStyles.controls}>
          <div className={editorStyles.group}>
            <span className={clsx(editorStyles.legend, styles.legend)}>
              {OPTION_LABELS.model}
            </span>
            <div className={editorStyles.models} aria-hidden={true}>
              {WIDGET_PRESETS.map(({ id, label }) => (
                <span key={id} className={clsx(chipStyles.card, styles.chip)}>
                  <span className={clsx(editorStyles.thumb, styles.thumb)} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {preset.supportsStyle && (
            <GroupSkeleton label={OPTION_LABELS.theme}>
              <ChipBones labels={WIDGET_THEMES.map(({ label }) => label)} />
            </GroupSkeleton>
          )}
          {preset.supportsLogo && (
            <GroupSkeleton label={OPTION_LABELS.logo}>
              <ChipBones labels={WIDGET_LOGOS.map(({ label }) => label)} />
            </GroupSkeleton>
          )}
          {preset.supportsLogo && (
            <GroupSkeleton label={OPTION_LABELS.accent}>
              {Object.keys(WIDGET_ACCENTS).map((accent) => (
                <span
                  key={accent}
                  className={clsx(chipStyles.swatch, styles.chip)}
                >
                  <span className={editorStyles.dot} />
                </span>
              ))}
            </GroupSkeleton>
          )}
          {preset.supportsRandom && (
            <GroupSkeleton label={OPTION_LABELS.random}>
              <ChipBones labels={showHide} />
            </GroupSkeleton>
          )}
          {preset.supportsNav && (
            <GroupSkeleton label={OPTION_LABELS.nav}>
              <ChipBones labels={showHide} />
            </GroupSkeleton>
          )}
        </div>

        <OutputSkeleton />
      </div>
    </div>
  )
}
