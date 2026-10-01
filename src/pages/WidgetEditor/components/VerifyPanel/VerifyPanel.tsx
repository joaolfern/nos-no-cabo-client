import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { LoadingDots } from '@/components/LoadingDots/LoadingDots'
import { useMessage } from '@/contexts/useMessage'
import { useVerifyWebsite } from '@/pages/WidgetEditor/hooks/useVerifyWebsite'
import { verifyFailureMessage } from './verifyMessages'
import styles from './VerifyPanel.module.scss'

type VerifyPanelProps = {
  websiteId: string
  websiteName: string
}

export function VerifyPanel({ websiteId, websiteName }: VerifyPanelProps) {
  const { showMessage } = useMessage()
  const verify = useVerifyWebsite(websiteId)
  const failure = verifyFailureMessage(verify.data, verify.error)

  function handleVerify() {
    verify.mutate(undefined, {
      onSuccess: ({ verified }) => {
        if (verified)
          showMessage(`Selo encontrado. ${websiteName} agora é verificado.`)
      },
    })
  }

  return (
    <section className={styles.panel} aria-label='Verificação do site'>
      <p className={styles.text}>
        Cuida deste site? Com o selo instalado, ele ganha o ícone de verificado
        e sobe nas listas.
      </p>
      <div className={styles.actions}>
        <Button asChild={true} variant='outline' small={true}>
          <Link to={`/websites/${websiteId}/selo`}>Adicionar o selo</Link>
        </Button>
        <Button
          type='button'
          variant='secondary'
          small={true}
          onClick={handleVerify}
          disabled={verify.isPending}
        >
          {verify.isPending ? (
            <>
              Verificando
              <LoadingDots />
            </>
          ) : (
            'Verificar'
          )}
        </Button>
      </div>
      <p className={styles.failure} role='status'>
        {failure}
      </p>
    </section>
  )
}
