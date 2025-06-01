import { v4 as uuidv4 } from 'uuid'; // 导入 uuid v4 函数

/**
 * 列字段类型定义
 */
export type ColumnType =
  | 'Text'       // 文本
  | 'Number'     // 数字
  | 'Date'       // 日期
  | 'Boolean'    // 布尔 (是/否)
  | 'SingleSelect' // 单选选项
  | 'MultiSelect';  // 多选选项

/**
 * 针对选择类型的选项定义
 */
export interface SelectOption {
  id: string;    // 选项的唯一ID
  name: string;  // 选项的显示名称
}

/**
 * 单元格的数据
 */
export interface CellData {
  value: any;
}

/**
 * 行的数据结构
 * 使用 Record<columnId, CellData> 来存储一行中每个单元格的数据
 * key 是 Column 的 id
 */
export type RowData = Record<string, CellData>;

/**
 * 列字段的定义
 */
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  order: number;
  options?: SelectOption[]; // 当 type 为 'SingleSelect' 或 'MultiSelect' 时使用
  dateFormat?: string; // Date 类型格式化
}

/**
 * 数据表的定义
 */
export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, RowData>;
  columnOrder: string[];
  rowOrder: string[];
}

/**
 * 数据库/工作空间的定义
 */
export interface BaseTable {
  id: string;
  name: string;
  tables: Table[];
}


export function generateId(): string {
  return uuidv4();
}
