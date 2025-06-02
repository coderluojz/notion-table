import { createTable, deleteTable, getAllTables, updateTable } from '@/services/db';
import { generateId, getDefaultCellValueByType, type Column, type ColumnType, type RowData, type TableData } from '@/types/data';
import { toast } from 'sonner';
import { create } from 'zustand';
interface AppState {
  tableList: TableData[];
  activeTableId: string | null; // 当前选中的 Table 的 ID


  loadTableList: () => Promise<void>;
  setActiveTableId: (tableId: string | null) => void;
  addNewTable: (tableName: string) => Promise<TableData | null>;
  deleteTableById: (tableId: string) => Promise<boolean>;
  addRowToActiveTable: () => Promise<void>
  addColumnToActiveTable: (columnName: string, columnType: ColumnType) => Promise<Column | null>;
  editCellToActiveTable: (rowId: string, columnId: string, newValue: any) => Promise<boolean>;
  deleteRowToActiveTable: (rowId: string) => Promise<boolean>;
  deleteColumnToActiveTable: (columnId: string) => Promise<boolean>;
}
export const useAppStore = create<AppState>((set, get) => ({
  /** 所有表格列表 */
  tableList: [],
  /** 当前选中的表格 id */
  activeTableId: null,


  /** 加载表格列表 */
  loadTableList: async () => {
    try {
      const allTables = await getAllTables();
      set({
        tableList: allTables,
        // 初始化时，默认选中第一个表格 (如果存在)
        activeTableId: allTables.length > 0 ? allTables[0].id : null,
      });
    } catch (error) {
      console.error("获取表格列表失败: ", error);
    }
  },
  /** 设置活动表格 id */
  setActiveTableId: (id: string | null) => {
    set({ activeTableId: id });
  },
  /** 添加新表格 */
  addNewTable: async (tableName: string) => {
    const defaultColumnId = generateId();
    const defaultRowId = generateId();
    const newTable: TableData = {
      id: generateId(),
      name: tableName,
      columns: [
        {
          id: defaultColumnId,
          name: '名称',
          type: 'Text',
          order: 0,
        } as Column,
      ],
      rows: {
        [defaultRowId]: {
          [defaultColumnId]: { value: '默认值' },
        }
      },
      columnOrder: [defaultColumnId],
      rowOrder: [defaultRowId]
    };
    try {
      await createTable(newTable);
      set((state) => ({
        tableList: [newTable, ...state.tableList],
        activeTableId: newTable.id,
      }));
      return newTable;
    } catch (error) {
      console.error("创建表格失败:", error);
      return null;
    }
  },
  deleteTableById: async (tableId: string): Promise<boolean> => {
    const currentTables = get().tableList;
    const currentActiveTableId = get().activeTableId;

    if (!currentTables.find(t => t.id === tableId)) {
      console.error(`表格${tableId}不存在`);
      return false;
    }

    try {
      await deleteTable(tableId);
      const filterTable = currentTables.filter(t => t.id !== tableId);
      let newActiveTableId = currentActiveTableId;

      // 如果删除的是当前激活的表格，则需要更新 activeTableId
      if (currentActiveTableId === tableId) {
        newActiveTableId = filterTable.length > 0 ? filterTable[0].id : null;
      }

      set({
        tableList: filterTable,
        activeTableId: newActiveTableId,
      });
      return true;
    } catch (error) {
      console.error(`删除表格${tableId}失败: `, error);
      return false;
    }
  },
  /** 添加行至激活的表格 */
  addRowToActiveTable: async (): Promise<void> => {
    const activeTableId = get().activeTableId;
    const currentTableList = get().tableList;
    const activeTable = currentTableList.find(t => t.id === activeTableId);

    if (!activeTable) {
      console.log("没有激活的表格");
      return;
    }

    const newRowId = generateId();
    const newRowData: RowData = {};

    // 为新行添加已有列的默认值
    activeTable.columns.forEach(column => {
      newRowData[column.id] = { value: getDefaultCellValueByType(column.type) };
    });

    const updatedTable: TableData = {
      ...activeTable,
      rows: {
        ...activeTable.rows,
        // 新的行数据
        [newRowId]: newRowData,
      },
      rowOrder: [...activeTable.rowOrder, newRowId],
    };

    try {
      await updateTable(updatedTable);
      set({
        tableList: currentTableList.map(t =>
          t.id === activeTableId ? updatedTable : t
        ),
      });
    } catch (error) {
      console.log('添加行失败: ', error);
    }
  },
  /** 添加行至激活的表格 */
  addColumnToActiveTable: async (columnName: string, columnType: ColumnType): Promise<Column | null> => {
    const activeTableId = get().activeTableId;
    const currentTableList = get().tableList;
    const activeTable = currentTableList.find(t => t.id === activeTableId);

    if (!activeTable) {
      console.log("没有激活的表格");
      return null;
    }

    // 检查列名重复
    if (activeTable.columns.some(col => col.name === columnName)) {
      toast.warning(`列名【${columnName}】已存在`);
      return null;
    }

    const newColumnId = generateId();
    const newColumn: Column = {
      id: newColumnId,
      name: columnName,
      type: columnType,
      order: activeTable.columns.length,
      // 这里默认直接给个下拉选择的数据
      options: columnType === 'SingleSelect' ? [{ id: '', name: '请选择' }, { id: 'HTML', name: 'HTML' }, { id: 'CSS', name: 'CSS' }, { id: 'JavaScript', name: 'JavaScript' },] : undefined,
    };

    // 为新列添加默认单元格数据
    const updateRows: Record<string, RowData> = {};
    Object.entries(activeTable.rows).forEach(([rowId, column]) => {
      updateRows[rowId] = {
        ...column,
        [newColumnId]: { value: getDefaultCellValueByType(columnType) },
      };
    });

    const updatedTable: TableData = {
      ...activeTable,
      columns: [...activeTable.columns, newColumn],
      columnOrder: [...activeTable.columnOrder, newColumnId],
      rows: updateRows,
    };

    try {
      await updateTable(updatedTable);
      set({
        tableList: currentTableList.map(t =>
          t.id === activeTableId ? updatedTable : t
        ),
      });
      return newColumn;
    } catch (error) {
      console.error("创建列事变: ", error);
      return null;
    }
  },
  /** 编辑单元格 */
  editCellToActiveTable: async (rowId: string, columnId: string, newValue: any): Promise<boolean> => {
    const activeTableId = get().activeTableId;
    const currentTableList = get().tableList;
    const activeTable = currentTableList.find(t => t.id === activeTableId);

    if (!activeTable) {
      console.log("没有激活的表格");
      return false;
    }

    const currentRow = activeTable.rows[rowId];
    if (!currentRow) {
      console.log(`行${rowId}不存在`);
      return false;
    }

    const currentColumn = activeTable.columns.find(col => col.id === columnId);
    if (!currentColumn) {
      console.log(`列${columnId}不存在`);
      return false;
    }

    const updatedRowData: RowData = {
      ...currentRow,
      [columnId]: { value: newValue },
    };

    const updatedTable: TableData = {
      ...activeTable,
      rows: {
        ...activeTable.rows,
        [rowId]: updatedRowData,
      },
    };

    try {
      await updateTable(updatedTable);
      set({
        tableList: currentTableList.map(t =>
          t.id === activeTableId ? updatedTable : t
        ),
      });
      return true;
    } catch (error) {
      console.error('编辑单元格失败: ', error);
      return false;
    }
  },
  /** 删除行 */
  deleteRowToActiveTable: async (rowId: string): Promise<boolean> => {
    const activeTableId = get().activeTableId;
    const currentTableList = get().tableList;
    const activeTable = currentTableList.find(t => t.id === activeTableId);

    if (!activeTable) {
      console.log("没有激活的表格");
      return false;
    }

    if (!activeTable.rows[rowId]) {
      console.log(`行${rowId}不存在`);
      return false;
    }

    const updatedRows = { ...activeTable.rows };
    delete updatedRows[rowId];

    const updatedRowOrder = activeTable.rowOrder.filter(id => id !== rowId);
    const updatedTable: TableData = {
      ...activeTable,
      rows: updatedRows,
      rowOrder: updatedRowOrder,
    };

    try {
      await updateTable(updatedTable);
      set({
        tableList: currentTableList.map(t =>
          t.id === activeTableId ? updatedTable : t
        ),
      });
      toast.success('删除行成功')
      return true;
    } catch (error) {
      console.log('error: ', error);
      toast.error('删除行失败')
      return false;
    }
  },
  /** 删除列 */
  deleteColumnToActiveTable: async (columnId: string): Promise<boolean> => {
    const activeTableId = get().activeTableId;
    const currentTableList = get().tableList;
    const activeTable = currentTableList.find(t => t.id === activeTableId);

    if (!activeTable) {
      console.log("没有激活的表格");
      return false;
    }

    const columnExists = activeTable.columns.find(col => col.id === columnId);
    if (!columnExists) {
      console.log(`列${columnId}不存在`);
      return false;
    }

    const updatedColumns = activeTable.columns.filter(col => col.id !== columnId);
    const updatedColumnOrder = activeTable.columnOrder.filter(id => id !== columnId);

    const updatedRows: Record<string, RowData> = {};

    for (const rowId in activeTable.rows) {
      const currentRowData = activeTable.rows[rowId];
      const newRowData: RowData = { ...currentRowData };
      // 删除对应列的数据
      delete newRowData[columnId];
      updatedRows[rowId] = newRowData;
    }

    const updatedTable: TableData = {
      ...activeTable,
      columns: updatedColumns,
      columnOrder: updatedColumnOrder,
      rows: updatedRows,
    };

    try {
      await updateTable(updatedTable);
      set({
        tableList: currentTableList.map(t =>
          t.id === activeTableId ? updatedTable : t
        ),
      });
      toast.success('删除列成功');
      return true;
    } catch (error) {
      console.log('error: ', error);
      toast.error('删除列失败');
      return false;
    }
  },
}))
