import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { MdContentCopy, MdShuffle } from 'react-icons/md'
import { Typography } from '@/components/Typography/Typography'
import { NOS_NO_CABO_URL } from '@/config/env'
import { Copyable } from '@/components/Copyable/Copyable'
import { Button } from '@/components/Button/Button'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import type { StepComponentProps } from '@/pages/WebsiteForm/WebsiteForm.types'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import styles from './InitialStep.module.scss'

export function InitialStep({ updateStep }: StepComponentProps) {
  return (
    <StepContainer>
      <Typography className={styles.title} variant='h3' asVariant={true}>
        Vamos lá!
      </Typography>
      <Typography className={styles.url} variant='body'>
        <Copyable text={NOS_NO_CABO_URL} />
      </Typography>

      <BannerEditor />

      <ConfirmButton onClick={() => updateStep(1)} />
    </StepContainer>
  )
}

type BannerMode = 'glassmorphism' | 'retro' | 'clean'
type BannerDensity = 'compact' | 'cozy' | 'poster'
type BannerIntensity = 'subtle' | 'balanced' | 'loud'
type BannerCorner = 'soft' | 'sharp' | 'capsule'

const WEBRING_NAME = 'Nós no Cabo'
const WEBRING_SLOGAN = 'Conectando a comunidade brasileira de tecnologia'
const WEBRING_PREVIOUS_LABEL = 'Anterior'
const WEBRING_NEXT_LABEL = 'Próximo'
const WEBRING_RANDOM_LABEL = 'Aleatório'
const COMPACT_DENSITY: BannerDensity = 'compact'

const MODE_LABELS: Record<BannerMode, string> = {
  glassmorphism: 'Glassmorphism 2025',
  retro: 'Retro',
  clean: 'Clean',
}

const INTENSITY_LABELS: Record<BannerIntensity, string> = {
  subtle: 'Subtle',
  balanced: 'Balanced',
  loud: 'Loud',
}

const CORNER_LABELS: Record<BannerCorner, string> = {
  soft: 'Soft',
  sharp: 'Sharp',
  capsule: 'Capsule',
}

function BannerEditor() {
  const [mode, setMode] = useState<BannerMode>('glassmorphism')
  const [intensity, setIntensity] = useState<BannerIntensity>('subtle')
  const [corner, setCorner] = useState<BannerCorner>('soft')
  const [showRandomButton, setShowRandomButton] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined

    const timeoutId = window.setTimeout(() => setCopied(false), 2000)

    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const bannerCode = useMemo(() => {
    const attributes = [
      `data-mode="${mode}"`,
      `data-density="${COMPACT_DENSITY}"`,
      `data-intensity="${intensity}"`,
      `data-corner="${corner}"`,
    ].join(' ')

    const randomButtonMarkup = showRandomButton
      ? `\n  <a href="https://www.nosnocabo.com/random" class="nnc-banner__button">${escapeHtml(WEBRING_RANDOM_LABEL)}</a>`
      : ''

    return `<aside class="nnc-banner" ${attributes}>\n  <a href="${NOS_NO_CABO_URL}" class="nnc-banner__brand">\n    <img src="https://www.nosnocabo.com/logos/logo.svg" alt="" aria-hidden="true" width="44" height="44" />\n    ${escapeHtml(WEBRING_NAME)}\n  </a>\n  <p class="nnc-banner__slogan">${escapeHtml(WEBRING_SLOGAN)}</p>\n  <nav class="nnc-banner__links" aria-label="Webring highlights">\n    <a href="#">${escapeHtml(WEBRING_PREVIOUS_LABEL)}</a>\n    <a href="#">${escapeHtml(WEBRING_NEXT_LABEL)}</a>\n  </nav>${randomButtonMarkup}\n</aside>`
  }, [corner, intensity, mode, showRandomButton])

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(bannerCode)
    setCopied(true)
  }

  return (
    <section className={styles.editor}>
      <div className={styles.editorHeader}>
        <div>
          <Typography variant='body' className={styles.editorLead}>
            Monte um badge da aliança para o seu site.
          </Typography>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.inspectorColumn}>
          <InspectorSection
            eyebrow='Vision Language'
            title='Visual language'
            description='Troque o acabamento sem abrir espaço demais para decisões arbitrárias.'
          >
            <SegmentedGroup<BannerMode>
              options={['glassmorphism', 'retro', 'clean']}
              value={mode}
              labels={MODE_LABELS}
              onChange={setMode}
            />
          </InspectorSection>

          <InspectorSection
            eyebrow='Finishing'
            title='Defined controls'
            description='Preset fixo em Compact. Aqui você ajusta intensidade, cantos e botão aleatório.'
          >
            <SegmentedGroup<BannerIntensity>
              options={['subtle', 'balanced', 'loud']}
              value={intensity}
              labels={INTENSITY_LABELS}
              onChange={setIntensity}
            />
            <SegmentedGroup<BannerCorner>
              options={['soft', 'sharp', 'capsule']}
              value={corner}
              labels={CORNER_LABELS}
              onChange={setCorner}
            />
            <button
              className={styles.toggleRow}
              data-active={showRandomButton}
              onClick={() => setShowRandomButton((current) => !current)}
              type='button'
            >
              <span>
                <MdShuffle size={16} />
                Random button
              </span>
              <strong>{showRandomButton ? 'On' : 'Off'}</strong>
            </button>
          </InspectorSection>
        </div>

        <div className={styles.stageColumn}>
          <div className={styles.stageSurface} data-mode={mode}>
            <div
              className={styles.previewBanner}
              data-mode={mode}
              data-density={COMPACT_DENSITY}
              data-intensity={intensity}
              data-corner={corner}
            >
              <div className={styles.previewGlow} />

              <div className={styles.previewBody}>
                <div className={styles.previewNameRow}>
                  <img
                    src='/logos/logo.svg'
                    alt=''
                    aria-hidden={true}
                    className={styles.previewLogo}
                    height={50}
                    width={50}
                  />
                  <Typography
                    variant='h2'
                    asVariant={true}
                    className={styles.previewName}
                  >
                    {WEBRING_NAME}
                  </Typography>
                </div>
                <Typography variant='body' className={styles.previewSlogan}>
                  {WEBRING_SLOGAN}
                </Typography>
              </div>

              <div className={styles.previewFooter}>
                <div className={styles.previewLinks}>
                  <span>{WEBRING_PREVIOUS_LABEL}</span>
                  <span>{WEBRING_NEXT_LABEL}</span>
                </div>
                {showRandomButton ? (
                  <button type='button' className={styles.previewButton}>
                    {WEBRING_RANDOM_LABEL}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.codePanel}>
            <div className={styles.codeHeader}>
              <div>
                <Typography variant='caption' className={styles.panelEyebrow}>
                  COPYABLE SNIPPET
                </Typography>
                <Typography variant='body' className={styles.panelTitle}>
                  Cole no seu site e depois troque os links reais.
                </Typography>
              </div>
              <Button onClick={handleCopyCode} type='button' small>
                <MdContentCopy size={16} />
                {copied ? 'Copiado' : 'Copiar código'}
              </Button>
            </div>

            <pre className={styles.codeBlock}>{bannerCode}</pre>
          </div>
        </div>
      </div>
    </section>
  )
}

type InspectorSectionProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

function InspectorSection({
  eyebrow,
  title,
  description,
  children,
}: InspectorSectionProps) {
  return (
    <section className={styles.inspectorSection}>
      <Typography variant='caption' className={styles.panelEyebrow}>
        {eyebrow}
      </Typography>
      <Typography variant='body' className={styles.panelTitle}>
        {title}
      </Typography>
      <Typography variant='bodySmall' className={styles.panelDescription}>
        {description}
      </Typography>
      <div className={styles.inspectorSectionBody}>{children}</div>
    </section>
  )
}

type SegmentedGroupProps<T extends string> = {
  options: T[]
  value: T
  labels: Record<T, string>
  onChange: (value: T) => void
}

function SegmentedGroup<T extends string>({
  options,
  value,
  labels,
  onChange,
}: SegmentedGroupProps<T>) {
  return (
    <div className={styles.segmentedGroup}>
      {options.map((option) => (
        <button
          key={option}
          className={styles.segmentedButton}
          data-active={value === option}
          onClick={() => onChange(option)}
          type='button'
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
