import { Scene } from '@/components/Scene/Scene'
import { useTheme } from '@/hooks/useTheme'
import styles from './NotFound.module.scss'
import { Link } from '@/components/Link/Link'
import { Typography } from '@/components/Typography/Typography'
import { MdHome } from 'react-icons/md'

export function NotFound() {
  const { mode } = useTheme()

  return (
    <div className={styles.container}>
      <Scene
        fallbackBackground='var(--color-background-400)'
        fallbackAccent='red'
        jsonFilePath={`/unicornStudio/${mode}/notFound.json`}
        width='400px'
        height='400px'
        fallbackText='Página não encontrada'
      />
      <Typography variant='body'>
        <Link to='/websites'>
          <MdHome /> Voltar para a página inicial
        </Link>
      </Typography>
    </div>
  )
}
