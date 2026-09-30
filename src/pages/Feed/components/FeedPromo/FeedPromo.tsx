import { LuPlus, LuSparkles } from 'react-icons/lu'
import { Button } from '@/components/Button/Button'
import { Link } from '@/components/Link/Link'
import styles from './FeedPromo.module.scss'

export function FeedPromo() {
  return (
    <section className={styles.promo}>
      <h2 className={styles.title}>
        <LuSparkles aria-hidden={true} />
        Divulgue um projeto
      </h2>
      <p className={styles.text}>
        Conhece um projeto que merece ser visto? Adicione ao diretório.
      </p>
      <Button variant='outline' className={styles.button} asChild>
        <Link to='/websites/novo'>
          <LuPlus aria-hidden={true} />
          Adicionar um site
        </Link>
      </Button>
    </section>
  )
}
