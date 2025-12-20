import type {
  IPreregisterWebsite,
  IRegisterWebsite,
} from '@/interfaces/IWebsite'

export type StepComponentProps = {
  updateStep: (step: number) => void
  setPreregister: (website: IPreregisterWebsite) => void
  preregister: IPreregisterWebsite | null
  onSuccess: (website: IRegisterWebsite) => void
}
