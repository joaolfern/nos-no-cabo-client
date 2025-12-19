import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { useAnimationToggler } from '@/pages/Website/hooks/useAnimationToggler'
import { useThemeSwitcher } from '@/pages/Website/hooks/useThemeSwitcher'
import { WebsiteForm } from '@/pages/WebsiteForm/WebsiteForm'

export function FloatingButtons() {
  const { handleTheme, themeIcon } = useThemeSwitcher()
  const { toggleAnimations, AnimationIcon } = useAnimationToggler()

  return (
    <>
      <WebsiteForm />
      <FloatingButton position='left' onClick={handleTheme} variant='secondary'>
        {themeIcon}
      </FloatingButton>
      <FloatingButton
        position='left'
        onClick={toggleAnimations}
        variant='secondary'
        padded={true}
      >
        <AnimationIcon />
      </FloatingButton>
    </>
  )
}
