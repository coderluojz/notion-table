import { createTable, deleteTable, getAllTables } from '@/services/db';
import { generateId, type TableData } from '@/types/data';
import { create } from 'zustand';
interface AppState {
  tableList: TableData[];
  activeTableId: string | null; // 当前选中的 Table 的 ID


  loadTableList: () => Promise<void>;
  setActiveTableId: (tableId: string | null) => void;
  addNewTable: (tableName: string) => Promise<TableData | null>;
  deleteTableById: (tableId: string) => Promise<boolean>;
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
    const newTable: TableData = {
      id: generateId(),
      name: tableName,
      columns: [],
      rows: {},
      columnOrder: [],
      rowOrder: []
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
}))
