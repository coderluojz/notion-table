
import Dexie, { type Table as DexieTable } from 'dexie';
import type { TableData } from '../types/data';
class NotionTableDatabase extends Dexie {
  public notionTables!: DexieTable<TableData, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({
      notionTables: 'id, name',
    });
  }
}

export const db = new NotionTableDatabase('NotionTableDB_v1')

/**
 * 获取所有表格
 */
export async function getAllTables(): Promise<TableData[]> {
  return await db.notionTables.toArray();
}

/**
 * 创建表格
 */
export async function createTable(table: TableData): Promise<string> {
  return await db.notionTables.add(table);
}
/**
 * 根据表格 id 获取数据
 */
export async function getTableById(tableId: string): Promise<TableData | undefined> {
  return await db.notionTables.get(tableId);
}

/**
 * 修改表格
 */
export async function updateTable(updatedTable: TableData): Promise<string> {
  return await db.notionTables.put(updatedTable);
}

/**
 * 根据表格 id 删除表格
 */
export async function deleteTable(tableId: string): Promise<void> {
  return await db.notionTables.delete(tableId);
}
