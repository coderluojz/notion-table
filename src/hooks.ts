import { useMemo } from 'react';
import { useAppStore } from './store/appStore';

export function useActiveTable() {
  const activeTableId = useAppStore(state => state.activeTableId)
  const tableList = useAppStore(state => state.tableList)

  const activeTable = useMemo(() => tableList.find(table => table.id === activeTableId), [activeTableId, tableList]);
  if (!activeTable) return null;
  return activeTable
}
