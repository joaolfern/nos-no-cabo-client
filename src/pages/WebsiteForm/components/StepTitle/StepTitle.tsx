import { Typography } from '@/components/Typography/Typography'
import { MdArrowBack } from 'react-icons/md'
import styles from './StepTitle.module.scss'

type StepTitleProps = {
  updateStep: (step: number) => void
  text: string
  index: number
}

export function StepTitle({ updateStep, text, index }: StepTitleProps) {
  function handleClick() {
    updateStep(Math.max(index - 1, 0))
  }

  return (
    <Typography variant='h3'>
      <button className={styles.buttonBack} onClick={handleClick}>
        <MdArrowBack size={18} />
        {text}
      </button>
    </Typography>
  )
}
