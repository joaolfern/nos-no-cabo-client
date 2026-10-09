import clsx from 'clsx'
import { Field } from '@/components/Field/Field'
import { TURNSTILE_SITE_KEY } from '@/config/env'
import { FeedCardSkeleton } from '@/pages/Feed/components/FeedCard/FeedCardSkeleton'
import {
  CATEGORY_NAMES,
  getCategoryMeta,
} from '@/pages/Feed/constants/categories'
import { SubmitFormHeader } from '@/pages/SubmitWebsite/components/SubmitForm/SubmitFormHeader'
import { SubmitWebsiteTrail } from '@/pages/SubmitWebsite/components/SubmitWebsiteTrail/SubmitWebsiteTrail'
import {
  FIELD_IDS,
  FIELD_LABELS,
  MAX_CATEGORIES,
} from '@/pages/SubmitWebsite/utils/submissionForm'
import buttonStyles from '@/components/Button/Button.module.scss'
import inputStyles from '@/components/Input/Input.module.scss'
import textareaStyles from '@/components/Textarea/Textarea.module.scss'
import turnstileStyles from '@/components/TurnstileField/TurnstileField.module.scss'
import pageStyles from '@/pages/SubmitWebsite/SubmitWebsite.module.scss'
import chipStyles from '@/pages/SubmitWebsite/components/CategoryPicker/CategoryChip.module.scss'
import pickerStyles from '@/pages/SubmitWebsite/components/CategoryPicker/CategoryPicker.module.scss'
import formStyles from '@/pages/SubmitWebsite/components/SubmitForm/SubmitForm.module.scss'
import previewStyles from '@/pages/SubmitWebsite/components/WebsitePreviewCard/WebsitePreviewCard.module.scss'
import styles from './SubmitWebsiteSkeleton.module.scss'

type BoneFieldProps = {
  field: 'url' | 'name' | 'description' | 'color'
  children: React.ReactNode
}

function BoneField({ field, children }: BoneFieldProps) {
  return (
    <Field id={`${FIELD_IDS[field]}-skeleton`} label={FIELD_LABELS[field]}>
      {children}
    </Field>
  )
}

function CategoryChipsSkeleton() {
  return (
    <div className={pickerStyles.picker}>
      <span className={clsx(pickerStyles.legend, styles.legend)}>
        {FIELD_LABELS.categories}{' '}
        <span className={pickerStyles.limit}>(até {MAX_CATEGORIES})</span>
      </span>
      <div className={pickerStyles.options} aria-hidden={true}>
        {CATEGORY_NAMES.map((name) => {
          const { label, Icon } = getCategoryMeta(name)
          return (
            <span key={name} className={clsx(chipStyles.chip, styles.chip)}>
              <Icon className={chipStyles.icon} aria-hidden={true} />
              {label}
            </span>
          )
        })}
      </div>
      <p className={pickerStyles.message} />
    </div>
  )
}

// The form while its chunk loads: the real layout and labels, with each control as a bone of its size.
export function SubmitWebsiteSkeleton() {
  return (
    <div
      className={pageStyles.page}
      role='status'
      aria-label='Carregando formulário'
    >
      <SubmitWebsiteTrail />
      <div className={formStyles.layout}>
        <SubmitFormHeader />

        <div className={formStyles.preview}>
          <section className={previewStyles.preview}>
            <p className={previewStyles.caption}>Assim ele aparece no feed</p>
            <FeedCardSkeleton variant='detailed' withTag={false} />
          </section>
        </div>

        <div className={formStyles.form}>
          <BoneField field='url'>
            <span className={clsx(inputStyles.input, styles.bone)} />
          </BoneField>
          <BoneField field='name'>
            <span className={clsx(inputStyles.input, styles.bone)} />
          </BoneField>
          <BoneField field='description'>
            <span
              className={clsx(
                textareaStyles.textarea,
                styles.bone,
                styles.textarea
              )}
            />
          </BoneField>
          <BoneField field='color'>
            <span className={formStyles.colorRow}>
              <span className={clsx(formStyles.swatch, styles.bone)} />
              <span
                className={clsx(
                  inputStyles.input,
                  formStyles.colorInput,
                  styles.bone
                )}
              />
            </span>
          </BoneField>

          <CategoryChipsSkeleton />

          {TURNSTILE_SITE_KEY && (
            <div className={turnstileStyles.widget}>
              <span className={clsx(styles.bone, styles.turnstile)} />
            </div>
          )}

          <div className={formStyles.actions} aria-hidden={true}>
            <span
              className={clsx(
                buttonStyles.button,
                buttonStyles.primary,
                styles.bone,
                styles.button
              )}
            >
              Enviar site
            </span>
          </div>
          <p className={formStyles.submitMessage} />
        </div>
      </div>
    </div>
  )
}
