import clsx from 'clsx'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { LuCodeXml } from 'react-icons/lu'
import { Link } from '@/components/Link/Link'
import { Typography } from '@/components/Typography/Typography'
import { NOS_NO_CABO_URL, RING_BASE_URL } from '@/config/env'
import { ChoiceChip } from '@/components/ChoiceChip/ChoiceChip'
import { CustomWidgetGuide } from '@/pages/WidgetEditor/components/CustomWidgetGuide/CustomWidgetGuide'
import { PreviewStage } from '@/pages/WidgetEditor/components/PreviewStage/PreviewStage'
import { SnippetCode } from '@/pages/WidgetEditor/components/SnippetCode/SnippetCode'
import { TermsConsent } from '@/pages/WidgetEditor/components/TermsConsent/TermsConsent'
import { useTermsAcceptance } from '@/pages/Terms/hooks/useTermsAcceptance'
import { WidgetEditorHeader } from '@/pages/WidgetEditor/components/WidgetEditorHeader/WidgetEditorHeader'
import { WidgetEditorTrail } from '@/pages/WidgetEditor/components/WidgetEditorTrail/WidgetEditorTrail'
import { WidgetRender } from '@/pages/WidgetEditor/components/WidgetRender/WidgetRender'
import {
  DEFAULT_SITE_NAME,
  OPTION_LABELS,
  SHOW_HIDE,
} from '@/pages/WidgetEditor/utils/optionLabels'
import { useSubmittedWebsite } from '@/pages/WidgetEditor/hooks/useSubmittedWebsite'
import { buildWidgetSnippet } from '@/pages/WidgetEditor/utils/buildWidgetSnippet'
import {
  DEFAULT_WIDGET_OPTIONS,
  WIDGET_ACCENTS,
  WIDGET_LOGOS,
  WIDGET_PRESETS,
  WIDGET_THEMES,
  presetDefinition,
  previewTheme,
  type Backdrop,
  type WidgetAccent,
  type WidgetOptions,
  type WidgetPreset,
} from '@/pages/WidgetEditor/utils/widgetPresets'
import styles from './WidgetEditor.module.scss'

const THUMB_SCALE: Record<Exclude<WidgetPreset, 'personalizado'>, number> = {
  faixa: 0.5,
  selo: 1.6,
  cartao: 0.52,
  texto: 0.6,
}

const TERMS_CONSENT_ID = 'widget-terms-consent'

function OptionGroup({
  label,
  disabled,
  children,
}: {
  label: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.choices}>{children}</div>
    </fieldset>
  )
}

function ModelThumb({
  websiteId,
  preset,
  options,
  backdrop,
}: {
  websiteId: string
  preset: WidgetPreset
  options: WidgetOptions
  backdrop: Backdrop
}) {
  const theme = previewTheme(options.theme, backdrop)

  // inert keeps the sample links from navigating or taking focus.
  return (
    <span
      className={clsx(
        styles.thumb,
        backdrop === 'claro' ? styles.thumbClaro : styles.thumbEscuro
      )}
      aria-hidden
      inert
    >
      {preset === 'personalizado' ? (
        <LuCodeXml className={styles.customIcon} />
      ) : (
        <span
          className={clsx(styles.thumbScale, {
            [styles.thumbText]: preset === 'texto',
          })}
          style={{ transform: `scale(${THUMB_SCALE[preset]})` }}
        >
          <WidgetRender
            websiteId={websiteId}
            options={{ ...options, preset, theme, nav: true }}
          />
        </span>
      )}
    </span>
  )
}

export function WidgetEditor() {
  const { id = '' } = useParams<{ id: string }>()
  const website = useSubmittedWebsite(id)
  usePageMeta({
    title: website.data ? `Selo de ${website.data.name}` : 'Selo',
    path: `/websites/${id}/selo`,
    noIndex: true,
  })
  const [options, setOptions] = useState<WidgetOptions>(DEFAULT_WIDGET_OPTIONS)
  const [backdrop, setBackdrop] = useState<Backdrop>('escuro')
  const terms = useTermsAcceptance()

  const preset = presetDefinition(options.preset)
  const isCustom = options.preset === 'personalizado'
  const hasRingLinks =
    (preset.supportsNav && options.nav) ||
    (preset.supportsRandom && options.random)
  const update = (patch: Partial<WidgetOptions>) =>
    setOptions((current) => ({ ...current, ...patch }))

  const code = useMemo(
    () =>
      buildWidgetSnippet({
        websiteId: id,
        options,
        homeUrl: NOS_NO_CABO_URL,
        ringBaseUrl: RING_BASE_URL,
      }),
    [id, options]
  )

  if (website.error?.code === 'not_found') {
    return (
      <div className={styles.page}>
        <Typography as='h1' variant='titleSm'>
          Não encontramos esse site
        </Typography>
        <Link className={styles.back} to='/websites'>
          Voltar para o feed
        </Link>
      </div>
    )
  }

  const siteName = website.data?.name ?? DEFAULT_SITE_NAME

  return (
    <div className={styles.page}>
      <WidgetEditorTrail websiteId={id} website={website.data} />
      <WidgetEditorHeader siteName={siteName} />

      <div className={styles.layout}>
        <div className={styles.controls}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>{OPTION_LABELS.model}</legend>
            <div className={styles.models}>
              {WIDGET_PRESETS.map(({ id: presetId, label }) => (
                <ChoiceChip
                  key={presetId}
                  name='modelo'
                  variant='card'
                  checked={options.preset === presetId}
                  onSelect={() => update({ preset: presetId })}
                >
                  <ModelThumb
                    websiteId={id}
                    preset={presetId}
                    options={options}
                    backdrop={backdrop}
                  />
                  {label}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>

          {preset.supportsStyle && (
            <OptionGroup label={OPTION_LABELS.theme}>
              {WIDGET_THEMES.map(({ id: theme, label }) => (
                <ChoiceChip
                  key={theme}
                  name='tema'
                  checked={options.theme === theme}
                  onSelect={() => update({ theme })}
                >
                  {label}
                </ChoiceChip>
              ))}
            </OptionGroup>
          )}

          {preset.supportsLogo && (
            <OptionGroup label={OPTION_LABELS.logo}>
              {WIDGET_LOGOS.map(({ id: logo, label }) => (
                <ChoiceChip
                  key={logo}
                  name='logo'
                  checked={options.logo === logo}
                  onSelect={() => update({ logo })}
                >
                  {label}
                </ChoiceChip>
              ))}
            </OptionGroup>
          )}

          {preset.supportsLogo && (
            <OptionGroup
              label={OPTION_LABELS.accent}
              disabled={options.logo !== 'cor'}
            >
              {(Object.keys(WIDGET_ACCENTS) as WidgetAccent[]).map((accent) => (
                <ChoiceChip
                  key={accent}
                  name='cor'
                  variant='swatch'
                  title={WIDGET_ACCENTS[accent].label}
                  checked={options.accent === accent}
                  onSelect={() => update({ accent })}
                >
                  <span
                    className={styles.dot}
                    style={{ background: WIDGET_ACCENTS[accent].claro }}
                  />
                </ChoiceChip>
              ))}
            </OptionGroup>
          )}

          {options.preset === 'texto' && (
            <p className={styles.note}>
              O modelo Texto usa a fonte e as cores do seu site, por isso não
              tem tema, cor nem logo.
            </p>
          )}

          {preset.supportsRandom && (
            <OptionGroup label={OPTION_LABELS.random}>
              {SHOW_HIDE.map(({ value, label }) => (
                <ChoiceChip
                  key={label}
                  name='aleatorio'
                  checked={options.random === value}
                  onSelect={() => update({ random: value })}
                >
                  {label}
                </ChoiceChip>
              ))}
            </OptionGroup>
          )}

          {preset.supportsNav && (
            <OptionGroup label={OPTION_LABELS.nav}>
              {SHOW_HIDE.map(({ value, label }) => (
                <ChoiceChip
                  key={label}
                  name='navegacao'
                  checked={options.nav === value}
                  onSelect={() => update({ nav: value })}
                >
                  {label}
                </ChoiceChip>
              ))}
            </OptionGroup>
          )}

          {isCustom && <CustomWidgetGuide websiteId={id} />}
        </div>

        <div className={styles.output}>
          {!isCustom && (
            <PreviewStage
              websiteId={id}
              options={options}
              backdrop={backdrop}
              onBackdropChange={setBackdrop}
            />
          )}
          <TermsConsent
            id={TERMS_CONSENT_ID}
            accepted={terms.accepted}
            onAcceptedChange={terms.setAccepted}
            canRemoveLinks={hasRingLinks}
            onRemoveLinks={() => update({ nav: false, random: false })}
          />
          <SnippetCode
            code={code}
            locked={!terms.accepted}
            lockedReasonId={TERMS_CONSENT_ID}
          />
          <p className={styles.hint}>
            {isCustom
              ? 'Use este código como ponto de partida e estilize como quiser.'
              : 'Cole em qualquer lugar do seu site, preferencialmente na sua página inicial.'}
          </p>
        </div>
      </div>
    </div>
  )
}
