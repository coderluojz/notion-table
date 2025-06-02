import { DATE_FORMAT, type ColumnType } from '@/types/data'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface EditCellProps {
  getValue: () => any
  row: { index: number; original: { __rowId: string } }
  column: {
    id: string
    columnDef: {
      meta?: {
        type?: ColumnType
        options?: SelectOption[]
      }
    }
  }
  table: {
    options: {
      meta?: {
        updateData?: (rowIndex: number, columnId: string, value: any) => void
      }
    }
  }
}

export default function EditCell({
  getValue,
  row,
  column,
  table,
}: EditCellProps) {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >(null)

  const cellMetaType = column.columnDef.meta?.type
  const cellMetaOptions = column.columnDef.meta?.options

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (cellMetaType !== 'Checkbox') {
      // 复选框通常单击交互
      setIsEditing(true)
    }
  }

  // 复选框点击
  const handleCellClick = () => {
    if (cellMetaType === 'Checkbox' && table.options.meta?.updateData) {
      const currentVal = Boolean(getValue()) // 因为是复选框 直接类型转换
      onSave(!currentVal)
    }
  }

  // 保存
  const onSave = (newValue?: any) => {
    if (table.options.meta?.updateData) {
      let processedValue = newValue !== undefined ? newValue : value
      if (cellMetaType === 'Number') {
        const num = Number(value)
        if (isNaN(num)) {
          processedValue = initialValue
          setValue(initialValue)
        } else {
          processedValue = num
        }
      } else if (cellMetaType === 'Checkbox') {
        processedValue = Boolean(processedValue)
      }
      table.options.meta.updateData(row.index, column.id, processedValue)
    }
    setIsEditing(false)
  }

  const handleBlur = () => {
    // 文本和数字类型在失焦时保存  Date、SingleSelect 在选择的时候已经保存上了
    if (['Text', 'Number'].includes(cellMetaType!) || !cellMetaType) {
      onSave()
    } else {
      setIsEditing(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target
    let newValue: string | boolean | number

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      newValue = target.checked
    } else {
      newValue = target.value
    }

    setValue(newValue)
    if (
      cellMetaType &&
      (cellMetaType === 'Date' || cellMetaType === 'SingleSelect')
    ) {
      onSave(newValue)
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSave()
    } else if (e.key === 'Escape') {
      setValue(initialValue) // 恢复原始值
      setIsEditing(false)
    }
  }

  if (isEditing) {
    switch (cellMetaType) {
      case 'Text':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''} // 处理 null/undefined
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full box-border p-1 border border-blue-500 rounded-sm text-sm outline-none"
          />
        )
      case 'Number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value === null || value === undefined ? '' : value} // number input 对空字符串处理较好
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full box-border p-1 border border-blue-500 rounded-sm text-sm outline-none text-right" // 数字通常右对齐
          />
        )
      case 'Date':
        const dateValue = dayjs(value).format(DATE_FORMAT)
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={dateValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full h-full box-border p-1 border border-blue-500 rounded-sm text-sm outline-none"
          />
        )
      case 'Checkbox':
        return (
          <div className="flex items-center h-full">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={Boolean(value)}
              onChange={handleChange}
              onBlur={handleBlur}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )
      case 'SingleSelect':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value === null || value === undefined ? '' : value}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full h-full box-border p-1 border border-blue-500 rounded-sm text-sm outline-none bg-white"
          >
            {cellMetaOptions?.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full box-border p-1 border border-blue-500 rounded-sm text-sm outline-none"
          />
        )
    }
  }

  let displayValue = String(value === null || value === undefined ? '' : value)
  if (cellMetaType === 'SingleSelect') {
    const selectedOption = cellMetaOptions?.find(
      (opt) => String(opt.value) === String(value)
    )
    displayValue = selectedOption
      ? selectedOption.label
      : value === null || value === undefined
      ? ''
      : String(value)
  } else if (cellMetaType === 'Date' && value) {
    try {
      displayValue = dayjs(value).format(DATE_FORMAT)
    } catch (e) {
      displayValue = String(value)
    }
  } else if (cellMetaType === 'Checkbox') {
    return (
      <div
        onClick={handleCellClick}
        className="w-full h-full flex items-center cursor-pointer p-1"
      >
        <input
          type="checkbox"
          checked={Boolean(value)}
          readOnly
          className="h-4 w-4 rounded  pointer-events-none"
        />
      </div>
    )
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full h-full p-1 text-sm min-h-[28px] flex items-center"
    >
      {displayValue}
    </div>
  )
}
