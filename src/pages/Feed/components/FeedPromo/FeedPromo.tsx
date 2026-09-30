import { LuPlus, LuSparkles } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { useWebsiteForm } from '@/pages/WebsiteForm/hooks/useWebsiteForm'
import styles from './FeedPromo.module.scss'

export function FeedPromo() {
  const { handleCreate } = useWebsiteForm()

  return (
    <section className={styles.promo}>
      <h2 className={styles.title}>
        <LuSparkles aria-hidden={true} />
        Divulgue seu projeto
      </h2>
      <p className={styles.text}>
        Adicione seu projeto ao diretório e alcance mais pessoas.
      </p>
      <Button
        variant='outline'
        className={styles.button}
        onClick={handleCreate}
      >
        <LuPlus aria-hidden={true} />
        Adicionar meu site
      </Button>
    </section>
  )
}
