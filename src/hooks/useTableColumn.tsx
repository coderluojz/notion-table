import EditCell from '@/components/edit-cell'
import type { RowDataType } from '@/components/main-content'
import { useAppStore } from '@/store/appStore'
import type { Column } from '@/types/data'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { CircleX, X } from 'lucide-react'
import { useMemo } from 'react'
import useActiveTable from './useActiveTable'

// 创建列辅助工具
const columnHelper = createColumnHelper<RowDataType>()
export default function useTableColumn() {
  const activeTable = useActiveTable()
  const deleteRowToActiveTable = useAppStore(
    (state) => state.deleteRowToActiveTable
  )
  const deleteColumnToActiveTable = useAppStore(
    (state) => state.deleteColumnToActiveTable
  )

  const tableColumns = useMemo(() => {
    if (!activeTable) return []
    const orderedColumns = activeTable.columnOrder
      .map((colId) => activeTable.columns.find((c) => c.id === colId))
      .filter(Boolean) as Column[]

    const dataColumns = orderedColumns.map((colDef) => {
      const mappedOptions = colDef.options?.map((opt) => ({
        value: opt.id,
        label: opt.name,
      }))

      return columnHelper.accessor(colDef.id, {
        header: (info) => {
          const columnId = info.column.id
          const columnName = colDef.name
          const handleDeleteColumn = async () => {
            await deleteColumnToActiveTable(columnId)
          }

          return (
            <div className="flex items-center justify-between group">
              <span>{columnName}</span>
              <button
                type="button"
                onClick={handleDeleteColumn}
                className="ml-2 p-0.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <CircleX />
              </button>
            </div>
          )
        },
        cell: (info) => {
          return <EditCell {...info} />
        },
        meta: {
          type: colDef.type,
          options: mappedOptions,
        },
      })
    })

    // 操作列
    const actionColumn: ColumnDef<RowDataType, any> = columnHelper.display({
      id: 'action-row', // 给操作列一个唯一的ID
      header: '操作',
      cell: (info) => {
        const rowId = info.row.original.__rowId
        const handleDelete = async () => {
          await deleteRowToActiveTable(rowId)
        }
        return (
          <div className="flex items-center">
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-700 text-xs flex gap-1 items-center"
              title="删除行"
            >
              <X />
              删除
            </button>
          </div>
        )
      },
      size: 30,
      maxSize: 30,
    })

    return [...dataColumns, actionColumn]
  }, [activeTable])

  return tableColumns
}
