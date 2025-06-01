
import Dexie, { type Table as DexieTable } from 'dexie';
import type { BaseTable } from '../types/data';
class NotionTableDatabase extends Dexie {
  public notionTables!: DexieTable<BaseTable, string>;
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
export async function getAllTables(): Promise<BaseTable[]> {
  return await db.notionTables.toArray();
}

/**
 * 创建表格
 */
export async function createTable(table: BaseTable): Promise<void> {
  await db.notionTables.add(table);
}
