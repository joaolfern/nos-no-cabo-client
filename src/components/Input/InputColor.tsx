import type { InputProps } from '@/components/Input/_InputProps'
import { Input } from '@/components/Input/Input'

type InputColorProps = InputProps

export function InputColor({ value, ...props }: InputColorProps) {
  const isColorValid =
    typeof value === 'string' ? /^#([0-9A-F]{3}){1,2}$/i.test(value) : false
  const validColor = isColorValid ? (value as string) : '#565656'

  return (
    <div>
      <div style={{ backgroundColor: validColor }} />
      <Input {...props} />
    </div>
  )
}
