import { useLocalStorageJson } from '@/hooks/useLocalStorageJson'
import {
  NO_ACCEPTED_TERMS,
  TERMS_ACCEPTED_KEY,
  TERMS_VERSION,
  isTermsVersion,
} from '@/pages/Terms/utils/terms'

export function useTermsAcceptance() {
  const [acceptedVersion, setAcceptedVersion] = useLocalStorageJson(
    TERMS_ACCEPTED_KEY,
    NO_ACCEPTED_TERMS,
    isTermsVersion
  )

  const setAccepted = (accepted: boolean) =>
    setAcceptedVersion(accepted ? TERMS_VERSION : NO_ACCEPTED_TERMS)

  return {
    accepted: acceptedVersion === TERMS_VERSION,
    setAccepted,
  }
}
