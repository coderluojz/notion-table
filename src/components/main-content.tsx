import { useActiveTable } from '@/hooks'
import { useAppStore } from '@/store/appStore'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { SelectDialog } from './select-dialog'
import { Button } from './ui/button'

// 创建列辅助工具
const columnHelper = createColumnHelper<Record<string, any>>()

export default function MainContent() {
  const activeTable = useActiveTable()
  const addRowToActiveTable = useAppStore((state) => state.addRowToActiveTable)

  const tableData = useMemo(() => {
    if (!activeTable || !activeTable.rows || !activeTable.rowOrder) return []

    const resultTableData = activeTable.rowOrder
      .map((rowId) => {
        const rowValue = activeTable.rows[rowId]
        if (!rowValue) {
          console.log(`行${rowId}不存在`)
          return null
        }
        const rowCellData: Record<string, any> = { __rowId: rowId }
        // 填充这行中每列的数据
        activeTable.columns.forEach((column) => {
          rowCellData[column.id] = rowValue[column.id]
            ? rowValue[column.id].value
            : undefined
        })
        return rowCellData
      })
      .filter((row) => row !== null) as Record<string, any>[]

    return resultTableData
  }, [activeTable])

  const tableColumns = useMemo(() => {
    if (!activeTable) return []
    const orderedColumns = activeTable.columnOrder
      .map((colId) => activeTable.columns.find((c) => c.id === colId))
      .filter(Boolean)

    return orderedColumns.map((colDef) => {
      return columnHelper.accessor(colDef!.id, {
        header: () => <span>{colDef!.name}</span>,
        cell: (info) => info.getValue(),
      })
    })
  }, [activeTable])

  const tableInstance = useReactTable({
    data: tableData,
    columns: tableColumns,
    // 行模型
    getCoreRowModel: getCoreRowModel(),
    // 开启行选择
    enableRowSelection: true,
  })

  if (!activeTable)
    return (
      <div className="flex-1 flex items-center justify-center">
        请选择左侧表格
      </div>
    )

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <SelectDialog />
          <Button variant="outline" onClick={addRowToActiveTable}>
            + 添加行
          </Button>
        </div>
        <h1 className="flex-1 text-3xl font-bold text-gray-800 pr-[187px] text-center">
          {activeTable?.name}
        </h1>
      </div>
      <div className="bg-white p-1 rounded shadow overflow-x-auto">
        {activeTable?.columns.length === 0 ? (
          <div className="p-4 text-center text-gray-500">请添加列</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {tableInstance.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableInstance.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <pre className="mt-4 text-xs bg-gray-50 p-2 rounded whitespace-pre">
        <strong>行排序 rowOrder:</strong> <br />
        {JSON.stringify(activeTable.rowOrder, null, 2)} <br />
        <strong>行排序后的数据 tableData:</strong> <br />
        {JSON.stringify(tableData, null, 2)} <br />
        <strong>列排序 columnOrder:</strong> <br />
        {JSON.stringify(activeTable.columnOrder, null, 2)} <br />
      </pre>
    </div>
  )
}
