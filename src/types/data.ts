import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid v4 函数

export const DATE_FORMAT = 'YYYY-MM-DD'; // 默认日期格式
/**
 * 列字段类型定义
 */
export type ColumnType =
  | 'Text'       // 文本
  | 'Number'     // 数字
  | 'Date'       // 日期
  | 'Checkbox'    // 多选框
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
export interface TableData {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, RowData>;
  columnOrder: string[];
  rowOrder: string[];
}

/**
 * 生成随机 id
 */
export function generateId(): string {
  return uuidv4();
}
/**
 * 根据类型获取默认单元格数据
 */
export function getDefaultCellValueByType(type: ColumnType): any {
  switch (type) {
    case 'Text':
      return '';
    case 'Number':
      return null;
    case 'Date':
      return dayjs().format(DATE_FORMAT).toString();
    case 'Checkbox':
      return false;
    case 'SingleSelect':
      return null;
    case 'MultiSelect':
      return [];
    default:
      return null;
  }
}
