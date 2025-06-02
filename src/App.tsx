import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppSidebar } from './components/app-sidebar'
import MainContent from './components/main-content'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { useAppStore } from './store/appStore'
import { generateId } from './types/data'
export default function App() {
  const loadTableList = useAppStore((state) => state.loadTableList)
  const addNewTable = useAppStore((state) => state.addNewTable)

  const [value, setValue] = useState('')
  async function handleCreateTable() {
    try {
      await addNewTable(value.trim() || `新表格-${generateId()}`)
      setValue('')
      toast.success(`创建成功`)
    } catch (error) {
      console.log('error: ', error)
      toast.success(`创建失败`)
    }
  }

  useEffect(() => {
    loadTableList()
  }, [loadTableList])

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 gap-4">
          <SidebarTrigger />
          <div className="flex-1 flex items-center gap-4">
            <Input
              className="max-w-100"
              placeholder="请输入名称"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
              }}
            />
            <Button className="max-w-100" onClick={handleCreateTable}>
              创建表格
            </Button>
          </div>
        </div>
        <MainContent />
      </main>
    </SidebarProvider>
  )
}
