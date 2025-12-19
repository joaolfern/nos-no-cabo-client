import { useTheme } from '@/hooks/useTheme'
import { MdMotionPhotosOff, MdMotionPhotosOn } from 'react-icons/md'

export function useAnimationToggler() {
  const { toggleAnimations, animationsEnabled } = useTheme()

  const AnimationIcon = animationsEnabled
    ? ICON_BY_ANIMATION_STATE.on
    : ICON_BY_ANIMATION_STATE.off

  return {
    toggleAnimations,
    AnimationIcon,
  }
}

const ICON_BY_ANIMATION_STATE = {
  on: MdMotionPhotosOn,
  off: MdMotionPhotosOff,
}
