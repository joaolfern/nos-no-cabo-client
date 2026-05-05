import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { MdShuffle } from 'react-icons/md'
import { RadioGroup } from '@/components/RadioGroup/RadioGroup'
import { Typography } from '@/components/Typography/Typography'
import { NOS_NO_CABO_URL } from '@/config/env'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import type { StepComponentProps } from '@/pages/WebsiteForm/WebsiteForm.types'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import styles from './InitialStep.module.scss'

export function InitialStep({ updateStep, setBannerCode }: StepComponentProps) {
  const [code, setCode] = useState('')

  function handleConfirm() {
    setBannerCode?.(code)
    updateStep(1)
  }

  return (
    <StepContainer>
      <Typography className={styles.title} variant='h3' asVariant={true}>
        Vamos lá!
      </Typography>

      <Typography variant='body' className={styles.editorLead}>
        Crie um badge da aliança para o seu site.
      </Typography>
      <BannerEditor onCodeChange={setCode} />
      <ConfirmButton onClick={handleConfirm} />
    </StepContainer>
  )
}

type BannerMode = 'glassmorphism' | 'retro' | 'clean'
type BannerDensity = 'compact' | 'cozy' | 'poster'
type BannerIntensity = 'subtle' | 'balanced' | 'loud'
type BannerCorner = 'soft' | 'sharp' | 'capsule'
type BannerScheme = 'dark' | 'light'

const WEBRING_NAME = 'Nós no Cabo'
const WEBRING_SLOGAN = 'Conectando a comunidade brasileira de tecnologia'
const WEBRING_PREVIOUS_LABEL = 'Anterior'
const WEBRING_NEXT_LABEL = 'Próximo'
const WEBRING_RANDOM_LABEL = 'Aleatório'
const COMPACT_DENSITY: BannerDensity = 'compact'

const MODE_LABELS: Record<BannerMode, string> = {
  glassmorphism: 'Glassmorphism',
  retro: 'Retrô',
  clean: 'Minimalista',
}

const INTENSITY_LABELS: Record<BannerIntensity, string> = {
  subtle: 'Sutil',
  balanced: 'Equilibrado',
  loud: 'Intenso',
}

const CORNER_LABELS: Record<BannerCorner, string> = {
  soft: 'Suave',
  sharp: 'Reto',
  capsule: 'Cápsula',
}

const SCHEME_LABELS: Record<BannerScheme, string> = {
  dark: 'Escuro',
  light: 'Claro',
}

function BannerEditor({
  onCodeChange,
}: {
  onCodeChange?: (code: string) => void
}) {
  const [mode, setMode] = useState<BannerMode>('glassmorphism')
  const [scheme, setScheme] = useState<BannerScheme>('dark')
  const [intensity, setIntensity] = useState<BannerIntensity>('subtle')
  const [corner, setCorner] = useState<BannerCorner>('soft')
  const [showRandomButton, setShowRandomButton] = useState(true)

  const bannerCode = useMemo(() => {
    const attributes = [
      `data-mode="${mode}"`,
      `data-scheme="${scheme}"`,
      `data-density="${COMPACT_DENSITY}"`,
      `data-intensity="${intensity}"`,
      `data-corner="${corner}"`,
    ].join(' ')

    const randomButtonMarkup = showRandomButton
      ? `\n  <a href="https://www.nosnocabo.com/random" class="nnc-banner__button">${escapeHtml(WEBRING_RANDOM_LABEL)}</a>`
      : ''

    return `<aside class="nnc-banner" ${attributes}>\n  <a href="${NOS_NO_CABO_URL}" class="nnc-banner__brand">\n    <img src="https://www.nosnocabo.com/logos/logo.svg" alt="" aria-hidden="true" width="44" height="44" />\n    ${escapeHtml(WEBRING_NAME)}\n  </a>\n  <p class="nnc-banner__slogan">${escapeHtml(WEBRING_SLOGAN)}</p>\n  <nav class="nnc-banner__links" aria-label="Webring highlights">\n    <a href="#">${escapeHtml(WEBRING_PREVIOUS_LABEL)}</a>\n    <a href="#">${escapeHtml(WEBRING_NEXT_LABEL)}</a>\n  </nav>${randomButtonMarkup}\n</aside>`
  }, [corner, intensity, mode, scheme, showRandomButton])

  useEffect(() => {
    onCodeChange?.(bannerCode)
  }, [bannerCode, onCodeChange])

  return (
    <section className={styles.editor}>
      <div className={styles.workspace}>
        <div className={styles.inspectorColumn}>
          <InspectorSection title='Estilo visual'>
            <RadioGroup<BannerMode, undefined>
              options={[
                { label: MODE_LABELS.glassmorphism, value: 'glassmorphism' },
                { label: MODE_LABELS.retro, value: 'retro' },
                { label: MODE_LABELS.clean, value: 'clean' },
              ]}
              value={mode}
              label=''
              labelOfSelected={MODE_LABELS[mode]}
              loading={false}
              onChange={setMode}
            />
            <RadioGroup<BannerScheme, undefined>
              options={[
                { label: SCHEME_LABELS.dark, value: 'dark' },
                { label: SCHEME_LABELS.light, value: 'light' },
              ]}
              value={scheme}
              label=''
              labelOfSelected={SCHEME_LABELS[scheme]}
              loading={false}
              onChange={setScheme}
            />
          </InspectorSection>

          <InspectorSection title='Acabamento'>
            <RadioGroup<BannerIntensity, undefined>
              options={[
                { label: INTENSITY_LABELS.subtle, value: 'subtle' },
                { label: INTENSITY_LABELS.balanced, value: 'balanced' },
                { label: INTENSITY_LABELS.loud, value: 'loud' },
              ]}
              value={intensity}
              label=''
              labelOfSelected={INTENSITY_LABELS[intensity]}
              loading={false}
              onChange={setIntensity}
            />
            <RadioGroup<BannerCorner, undefined>
              options={[
                { label: CORNER_LABELS.soft, value: 'soft' },
                { label: CORNER_LABELS.sharp, value: 'sharp' },
                { label: CORNER_LABELS.capsule, value: 'capsule' },
              ]}
              value={corner}
              label=''
              labelOfSelected={CORNER_LABELS[corner]}
              loading={false}
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
                Botão aleatório
              </span>
              <strong>{showRandomButton ? 'Ativo' : 'Inativo'}</strong>
            </button>
          </InspectorSection>
        </div>

        <div className={styles.stageColumn}>
          <div
            className={styles.stageSurface}
            data-mode={mode}
            data-scheme={scheme}
          >
            <BannerPreview
              mode={mode}
              scheme={scheme}
              intensity={intensity}
              corner={corner}
              showRandomButton={showRandomButton}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

type BannerVariantProps = {
  scheme: BannerScheme
  intensity: BannerIntensity
  corner: BannerCorner
  showRandomButton: boolean
}

type BannerPreviewProps = BannerVariantProps & { mode: BannerMode }

function BannerPreview({ mode, ...props }: BannerPreviewProps) {
  if (mode === 'retro') return <RetroBanner {...props} />
  if (mode === 'clean') return <CleanBanner {...props} />
  return <GlassmorphismBanner {...props} />
}

function GlassmorphismBanner({
  scheme,
  intensity,
  corner,
  showRandomButton,
}: BannerVariantProps) {
  return (
    <div
      className={styles.glassBanner}
      data-scheme={scheme}
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
  )
}

function RetroBanner({
  scheme,
  intensity,
  corner,
  showRandomButton,
}: BannerVariantProps) {
  return (
    <div
      className={styles.retroBanner}
      data-scheme={scheme}
      data-intensity={intensity}
      data-corner={corner}
    >
      <div className={styles.retroScanlines} aria-hidden={true} />
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
      <div className={styles.retroFooter}>
        <div className={styles.retroLinks}>
          <span className={styles.retroNavLink}>{WEBRING_PREVIOUS_LABEL}</span>
          <span className={styles.retroNavLink}>{WEBRING_NEXT_LABEL}</span>
        </div>
        {showRandomButton ? (
          <button type='button' className={styles.retroRandomButton}>
            {WEBRING_RANDOM_LABEL}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function CleanBanner({
  scheme,
  intensity,
  corner,
  showRandomButton,
}: BannerVariantProps) {
  return (
    <div
      className={styles.cleanBanner}
      data-scheme={scheme}
      data-intensity={intensity}
      data-corner={corner}
    >
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
        <div className={styles.cleanLinks}>
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
  )
}

type InspectorSectionProps = {
  title: string
  children: ReactNode
}

function InspectorSection({ title, children }: InspectorSectionProps) {
  return (
    <section className={styles.inspectorSection}>
      <Typography variant='body' className={styles.panelTitle}>
        {title}
      </Typography>
      <div className={styles.inspectorSectionBody}>{children}</div>
    </section>
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
