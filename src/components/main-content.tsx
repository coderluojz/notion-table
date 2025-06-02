import useActiveTable from '@/hooks/useActiveTable'
import useTableColumn from '@/hooks/useTableColumn'
import { useAppStore } from '@/store/appStore'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from '@tanstack/react-table'
import React, { useMemo } from 'react'
import { SelectDialog } from './select-dialog'
import { Button } from './ui/button'

export type RowDataType = Record<string, any> & { __rowId: string }

interface DraggableRowProps {
  row: Row<RowDataType>
  children: React.ReactNode
}
const DraggableRow: React.FC<DraggableRowProps> = ({ row, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.__rowId,
    data: { type: 'row' },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`hover:bg-gray-50 ${isDragging ? 'shadow-lg' : ''}`}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0 && React.isValidElement(child)) {
          return React.cloneElement(child, {
            // @ts-ignore
            children: (
              <div className="flex items-center">
                <button
                  {...listeners}
                  className="cursor-grab pr-2 text-gray-400 hover:text-gray-600"
                >
                  ⠿
                </button>
                {/* @ts-ignore */}
                {child.props.children}
              </div>
            ),
          })
        }
        return child
      })}
    </tr>
  )
}

export default function MainContent() {
  const activeTable = useActiveTable()
  const addRowToActiveTable = useAppStore((state) => state.addRowToActiveTable)
  const editCellToActiveTable = useAppStore(
    (state) => state.editCellToActiveTable
  )
  const handleTableOrder = useAppStore((state) => state.tableOrder)

  const columnOrderIds = useMemo(
    () => activeTable?.columnOrder || [],
    [activeTable?.columnOrder]
  )
  const rowOrderIds = useMemo(
    () => activeTable?.rowOrder || [],
    [activeTable?.rowOrder]
  )

  const tableData = useMemo(() => {
    if (!activeTable || !activeTable.rows || !activeTable.rowOrder) return []

    const resultTableData = activeTable.rowOrder
      .map((rowId) => {
        const rowValue = activeTable.rows[rowId]
        if (!rowValue) {
          console.log(`行${rowId}不存在`)
          return null
        }
        const rowCellData: RowDataType = { __rowId: rowId }
        // 填充这行中每列的数据
        activeTable.columns.forEach((column) => {
          rowCellData[column.id] = rowValue[column.id]
            ? rowValue[column.id].value
            : undefined
        })
        return rowCellData
      })
      .filter((row) => row !== null) as RowDataType[]

    return resultTableData
  }, [activeTable])

  const tableColumns = useTableColumn()

  const tableInstance = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: {
      columnOrder: columnOrderIds,
    },
    getRowId: (row) => row.__rowId,
    // 行模型
    getCoreRowModel: getCoreRowModel(),
    // 开启行选择
    enableRowSelection: true,
    meta: {
      updateData: (rowId: string, columnId: string, value: any) => {
        if (rowId) {
          editCellToActiveTable(rowId, columnId, value)
        } else {
          console.log(`${rowId} 不存在`)
        }
      },
    },
  })

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {})
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const itemType = active.data.current?.type
    console.log('itemType: ', itemType)

    if (itemType === 'column' && activeTable) {
      // 列拖拽
      const oldOrder = [...activeTable.columnOrder]
      const oldIndex = oldOrder.indexOf(active.id as string)
      const newIndex = oldOrder.indexOf(over.id as string)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedIds = arrayMove(oldOrder, oldIndex, newIndex)
        handleTableOrder(newOrderedIds, 'column')
      }
    } else if (itemType === 'row' && activeTable) {
      // 行拖拽
      const oldOrder = [...activeTable.rowOrder]
      const oldIndex = oldOrder.indexOf(active.id as string)
      const newIndex = oldOrder.indexOf(over.id as string)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedIds = arrayMove(oldOrder, oldIndex, newIndex)
        handleTableOrder(newOrderedIds, 'row')
      }
    }
  }

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        id={`dnd-context-cols-${activeTable.id}`}
      >
        <div className="bg-white rounded shadow overflow-x-auto">
          {activeTable?.columns.length === 0 ? (
            <div className="p-4 text-center text-gray-500">请添加列</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {tableInstance.getHeaderGroups().map((headerGroup) => (
                  <SortableContext
                    key={`col-${headerGroup.id}`}
                    items={columnOrderIds}
                    strategy={horizontalListSortingStrategy}
                  >
                    <tr key={headerGroup.id}>
                      <th className="px-4 py-2 border-b border-r border-gray-200 bg-gray-50 w-10 sticky left-0 z-10"></th>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            width: header.getSize(),
                            minWidth: header.column.columnDef.minSize,
                            maxWidth: header.column.columnDef.maxSize,
                          }}
                          scope="col"
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 border-r border-gray-200 last:border-r-0"
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
                  </SortableContext>
                ))}
              </thead>
              <SortableContext
                items={rowOrderIds} // <--- 使用行ID顺序
                strategy={verticalListSortingStrategy} // 垂直排序策略
              >
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableInstance.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400 border-r border-gray-200 text-center sticky left-0 bg-white group-hover:bg-gray-50 z-0"></td>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200 last:border-r-0"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </DraggableRow>
                  ))}
                </tbody>
              </SortableContext>
            </table>
          )}
        </div>
      </DndContext>
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
