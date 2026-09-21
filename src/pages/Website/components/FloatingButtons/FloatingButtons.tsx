import { FloatingButton } from '@/components/FloatingButton/FloatingButton'
import { useAnimationToggler } from '@/pages/Website/hooks/useAnimationToggler'
import { useThemeSwitcher } from '@/pages/Website/hooks/useThemeSwitcher'
import { WebsiteFormFloating } from '@/pages/WebsiteForm/WebsiteFormFloating'

export function FloatingButtons() {
  const { handleTheme, themeIcon } = useThemeSwitcher()
  const { toggleAnimations, AnimationIcon } = useAnimationToggler()

  return (
    <>
      <WebsiteFormFloating />
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
