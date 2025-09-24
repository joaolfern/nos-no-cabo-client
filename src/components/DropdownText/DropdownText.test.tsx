import { render, screen } from '@testing-library/react'
import { DropdownText } from './DropdownText'
import { FaChevronDown } from 'react-icons/fa'
import { useState } from 'react'
import type { DropdownTextProps } from '@/components/DropdownText/DropdownTextInterfaces'
import type { ValueType } from '@/components/Dropdown/DropdownInterfaces'

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
]

function TestDropdownText<T, M extends boolean | undefined>(
  props: Partial<DropdownTextProps<T, M>> &
    Pick<DropdownTextProps<T, M>, 'options'>
) {
  const [value, setValue] = useState<ValueType<T, M>>(
    (props.multiple ? [] : props.options?.[0]?.value) as ValueType<T, M>
  )

  const valueLabel =
    options.find((option) => option.value === value)?.label || ''

  const onChange = (newValue: T) => {
    if (props.multiple) {
      const isAdding = !(value as T[]).includes(newValue)

      setValue(
        isAdding
          ? ([...(value as T[]), newValue] as ValueType<T, M>)
          : ((value as T[]).filter((v) => v !== newValue) as ValueType<T, M>)
      )
    } else {
      setValue(newValue as ValueType<T, M>)
    }
  }

  return (
    <DropdownText
      onChange={onChange}
      {...props}
      value={value}
      options={props.options ?? []}
      Icon={FaChevronDown}
      valueLabel={valueLabel}
    />
  )
}

describe('DropdownText', () => {
  it('supports multiple selection', () => {
    render(
      <TestDropdownText options={options} multiple={false}>
        LabelText
      </TestDropdownText>
    )
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  function setup(props = {}) {
    return render(
      <TestDropdownText options={options} {...props}>
        LabelText
      </TestDropdownText>
    )
  }

  it('shows the value label', () => {
    setup()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('shows the icon', () => {
    setup()
    expect(screen.getByTestId('dropdown-icon')).toBeInTheDocument()
  })

  it('shows the children label only on desktop', () => {
    window.innerWidth = 1200
    setup()
    expect(screen.getByText('LabelText')).toBeInTheDocument()
  })

  it('does not show the children label on mobile', () => {
    window.innerWidth = 500
    setup()
    expect(screen.queryByText('LabelText')).not.toBeInTheDocument()
  })
})
