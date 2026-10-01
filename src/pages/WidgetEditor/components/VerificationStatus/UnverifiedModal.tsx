import {
  LuArrowRight,
  LuBadgeHelp,
  LuHeart,
  LuTrendingUp,
  LuX,
} from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import { Modal } from '@/components/Modal/Modal'
import { useTheme } from '@/hooks/useTheme'
import { WidgetRender } from '@/pages/WidgetEditor/components/WidgetRender/WidgetRender'
import styles from './VerificationStatus.module.scss'

type UnverifiedModalProps = {
  websiteId: string
  websiteName: string
  isOpen: boolean
  onClose: () => void
}

export function UnverifiedModal({
  websiteId,
  websiteName,
  isOpen,
  onClose,
}: UnverifiedModalProps) {
  const { mode } = useTheme()
  const titleId = `unverified-${websiteId}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant='message'>
      <div
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
      >
        <div className={styles.modalHead}>
          <span className={styles.modalIcon}>
            <LuBadgeHelp aria-hidden />
          </span>
          <h2 id={titleId} className={styles.modalTitle}>
            {websiteName} ainda não foi verificado
          </h2>
          <button
            type='button'
            className={styles.close}
            onClick={onClose}
            aria-label='Fechar'
          >
            <LuX aria-hidden />
          </button>
        </div>
        <p className={styles.modalText}>
          O Nós no Cabo é feito pela comunidade: qualquer pessoa pode indicar um
          projeto. Por isso, ainda não temos a confirmação de que quem mantém o{' '}
          {websiteName} aprova estar aqui. Para confirmar, basta exibir o selo
          no site:
        </p>
        <div className={styles.preview} inert>
          <WidgetRender
            websiteId={websiteId}
            options={{
              preset: 'faixa',
              theme: mode === 'dark' ? 'escuro' : 'claro',
              accent: 'rosa',
              logo: 'cor',
              nav: false,
              random: true,
            }}
          />
        </div>
        <ul className={styles.benefits}>
          <li>
            <LuTrendingUp aria-hidden />O site aparece primeiro nas listas e nas
            recomendações.
          </li>
          <li>
            <LuHeart aria-hidden />E ajuda a prestigiar este e muitos outros
            projetos de tecnologia brasileiros.
          </li>
        </ul>
        <div className={styles.actions}>
          <Button variant='secondary' onClick={onClose}>
            Entendi
          </Button>
          <Button asChild>
            <Link to={`/websites/${websiteId}/selo`}>
              Sou responsável pelo {websiteName}
              <LuArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
