import { CATEGORY_NAMES } from '@/pages/Feed/constants/categories'
import { splitVisibleCategories } from '@/pages/Feed/utils/splitVisibleCategories'
import styles from './CategoryList.module.scss'

const EVERY_CATEGORY = CATEGORY_NAMES.map((value) => ({ value }))

// As many rows as the list shows with every category in use: "Todos", the categories and "Mais categorias".
function rowsWhileLoading(maxRows: number) {
  const { visible, hidden } = splitVisibleCategories(
    EVERY_CATEGORY,
    maxRows,
    null
  )
  return 1 + visible.length + (hidden.length > 0 ? 1 : 0)
}

export function CategoryRowsSkeleton({ maxRows }: { maxRows: number }) {
  return Array.from({ length: rowsWhileLoading(maxRows) }, (_, index) => (
    <div key={index} className={styles.row} aria-hidden={true}>
      <span className={styles.iconBone} />
      <span className={styles.labelBone} />
      <span className={styles.countBone}>00</span>
    </div>
  ))
}
