import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useState } from 'react'
import { AppSidebar } from './components/app-sidebar'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { createTable } from './services/db'
import { generateId } from './types/data'
export default function App() {
  const [value, setValue] = useState('')
  async function handleCreateTable() {
    try {
      await createTable({
        id: generateId(),
        name: value,
        tables: [],
      })
      setValue('')
    } catch (error) {
      console.log('error: ', error)
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col gap-4">
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
      </main>
    </SidebarProvider>
  )
}
