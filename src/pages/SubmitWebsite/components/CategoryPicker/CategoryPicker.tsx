import clsx from 'clsx'
import {
  CATEGORY_NAMES,
  getCategoryMeta,
} from '@/pages/Feed/constants/categories'
import { fieldMessageId } from '@/pages/SubmitWebsite/components/Field/fieldMessageId'
import {
  FIELD_IDS,
  MAX_CATEGORIES,
} from '@/pages/SubmitWebsite/utils/submissionForm'
import { CategoryChip } from './CategoryChip'
import styles from './CategoryPicker.module.scss'

type CategoryPickerProps = {
  value: string[]
  onChange: (categories: string[]) => void
  error?: string
}

export function CategoryPicker({
  value,
  onChange,
  error,
}: CategoryPickerProps) {
  const isFull = value.length >= MAX_CATEGORIES
  const lastSelected = value.at(-1)
  const lastSelectedMeta = lastSelected && getCategoryMeta(lastSelected)

  function toggle(name: string, checked: boolean) {
    onChange(checked ? [...value, name] : value.filter((c) => c !== name))
  }

  return (
    <fieldset
      id={FIELD_IDS.categories}
      className={styles.picker}
      aria-describedby={fieldMessageId(FIELD_IDS.categories)}
    >
      <legend className={styles.legend}>
        Categorias <span className={styles.limit}>(até {MAX_CATEGORIES})</span>
      </legend>
      <div className={styles.options}>
        {CATEGORY_NAMES.map((name) => {
          const { label, Icon } = getCategoryMeta(name)
          const checked = value.includes(name)

          return (
            <CategoryChip
              key={name}
              label={label}
              Icon={Icon}
              checked={checked}
              disabled={isFull && !checked}
              onChange={(isChecked) => toggle(name, isChecked)}
            />
          )
        })}
      </div>
      <p
        id={fieldMessageId(FIELD_IDS.categories)}
        className={clsx(styles.message, { [styles.error]: error })}
        aria-live='polite'
      >
        {error ??
          (lastSelectedMeta ? (
            <>
              <lastSelectedMeta.Icon
                className={styles.messageIcon}
                aria-hidden={true}
              />
              <span>{lastSelectedMeta.description}</span>
            </>
          ) : (
            'Em quais áreas o projeto faz diferença?'
          ))}
      </p>
    </fieldset>
  )
}
