import { LuCircleCheck } from 'react-icons/lu'
import { NOS_NO_CABO_URL, RING_BASE_URL } from '@/config/env'
import { widgetLinks } from '@/pages/WidgetEditor/utils/buildWidgetSnippet'
import styles from './CustomWidgetGuide.module.scss'

export function CustomWidgetGuide({ websiteId }: { websiteId: string }) {
  const links = widgetLinks(websiteId, NOS_NO_CABO_URL, RING_BASE_URL)

  return (
    <section className={styles.guide} aria-label='Como montar o seu selo'>
      <p className={styles.text}>
        Monte o selo do seu jeito. Para o site ser verificado, mantenha no
        código:
      </p>
      <ul className={styles.required}>
        <li>
          <LuCircleCheck aria-hidden />
          <span>
            O atributo <code>data-nnc-widget="{websiteId}"</code> no elemento
            que envolve o selo.
          </span>
        </li>
        <li>
          <LuCircleCheck aria-hidden />
          <span>
            Um link para o Nós no Cabo: <code>{links.home}</code>
          </span>
        </li>
      </ul>
      <p className={styles.text}>Links que você pode usar:</p>
      <dl className={styles.links}>
        <dt>Anterior</dt>
        <dd>
          <code>{links.prev}</code>
        </dd>
        <dt>Aleatório</dt>
        <dd>
          <code>{links.random}</code>
        </dd>
        <dt>Próximo</dt>
        <dd>
          <code>{links.next}</code>
        </dd>
      </dl>
    </section>
  )
}
