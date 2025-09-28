import type { IPreregisterWebsite } from '@/interfaces/IWebsite'

export type StepComponentProps = {
  updateStep: (step: number) => void
  setPreregister: (website: IPreregisterWebsite) => void
  preregister: IPreregisterWebsite | null
  onSuccess: () => void
}
