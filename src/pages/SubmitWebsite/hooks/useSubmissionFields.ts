import { useCallback, useState } from 'react'
import type { IWebsitePreview } from '@/interfaces/IWebsite'
import {
  DEFAULT_COLOR,
  toHexColor,
  type SubmissionFormValues,
} from '@/pages/SubmitWebsite/utils/submissionForm'

type EditableField = 'name' | 'description' | 'color'

// Untouched fields follow the scraped preview; edited ones keep the user's text.
export function useSubmissionFields(
  url: string,
  preview: IWebsitePreview | undefined
) {
  const [edits, setEdits] = useState<Partial<Record<EditableField, string>>>({})
  const [categories, setCategories] = useState<string[]>([])

  const values: SubmissionFormValues = {
    url,
    name: edits.name ?? preview?.name ?? '',
    description: edits.description ?? preview?.description ?? '',
    color: edits.color ?? toHexColor(preview?.color) ?? DEFAULT_COLOR,
    categories,
  }

  const editField = useCallback((field: EditableField, value: string) => {
    setEdits((current) => ({ ...current, [field]: value }))
  }, [])

  const isDirty =
    url.trim() !== '' || Object.keys(edits).length > 0 || categories.length > 0

  return { values, isDirty, editField, setCategories }
}
