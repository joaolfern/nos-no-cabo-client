import { Loading } from '@/components/Loading/Loading'
import { Typography } from '@/components/Typography/Typography'
import { useKeywordsData, useRegisterWebsite } from '@/hooks/useDataHooks'
import type { IRegisterWebsite } from '@/interfaces/IWebsite'
import {
  getCategoryMeta,
  sortByCategoryOrder,
} from '@/pages/Feed/constants/categories'
import type { StepComponentProps } from '@/pages/WebsiteForm/WebsiteForm.types'
import { ConfirmButton } from '@/pages/WebsiteForm/components/ConfirmButton/ConfirmButton'
import { StepContainer } from '@/pages/WebsiteForm/components/StepContainer/StepContainer'
import { StepDescription } from '@/pages/WebsiteForm/components/StepDescription/StepDescription'
import { StepTitle } from '@/pages/WebsiteForm/components/StepTitle/StepTitle'
import { useState } from 'react'
import { CategoryChip } from './CategoryChip'
import styles from './KeywordsStep.module.scss'

export function KeywordsStep({
  updateStep,
  preregister,
  onSuccess,
}: StepComponentProps) {
  const [keywords, setKeywords] = useState<string[]>([])
  const { data: categories = [], isLoading } = useKeywordsData()
  const { mutate, isPending, error } = useRegisterWebsite()
  const lastSelected = keywords.at(-1)
  const lastSelectedMeta = lastSelected && getCategoryMeta(lastSelected)

  function toggle(name: string, checked: boolean) {
    setKeywords((current) =>
      checked ? [...current, name] : current.filter((k) => k !== name)
    )
  }

  function onConfirm() {
    if (!preregister) return

    const website: IRegisterWebsite = { ...preregister, keywords }

    mutate(website, {
      onSuccess: () => {
        onSuccess(website)
      },
    })
  }

  return (
    <StepContainer>
      <StepTitle updateStep={updateStep} text='Categorias' index={5} />
      <StepDescription>
        Em quais áreas seu projeto faz diferença? Escolha uma ou mais.
      </StepDescription>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <fieldset className={styles.options}>
            <legend className={styles.legend}>Categorias</legend>
            {sortByCategoryOrder(categories).map(({ id, name }) => {
              const { label, Icon } = getCategoryMeta(name)

              return (
                <CategoryChip
                  key={id}
                  label={label}
                  Icon={Icon}
                  checked={keywords.includes(name)}
                  onChange={(checked) => toggle(name, checked)}
                />
              )
            })}
          </fieldset>
          <p className={styles.detail} aria-live='polite'>
            {lastSelectedMeta ? (
              <>
                <lastSelectedMeta.Icon
                  className={styles.detailIcon}
                  aria-hidden={true}
                />
                <span>{lastSelectedMeta.description}</span>
              </>
            ) : (
              'Selecione uma categoria para ver o que ela abrange.'
            )}
          </p>
        </>
      )}
      {error && (
        <Typography variant='caption'>
          Ocorreu um erro: {error.message}
        </Typography>
      )}
      <ConfirmButton
        onClick={onConfirm}
        disabled={isPending || keywords.length === 0}
      >
        {isPending ? 'Salvando...' : 'Salvar'}
      </ConfirmButton>
    </StepContainer>
  )
}
