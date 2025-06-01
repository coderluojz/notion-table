import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { Delete, Home } from 'lucide-react'
import { toast } from 'sonner'

export function AppSidebar() {
  const tableList = useAppStore((state) => state.tableList)
  const activeTableId = useAppStore((state) => state.activeTableId)
  const setActiveTableId = useAppStore((state) => state.setActiveTableId)
  const deleteTableById = useAppStore((state) => state.deleteTableById)

  async function handleDelete(id: string, name: string) {
    try {
      await deleteTableById(id)
      toast.success(`删除成功`)
    } catch (error) {
      toast.error(`删除表格 "${name}" 失败。`)
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Notion Tables</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tableList.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.id}
                      className={cn(
                        'p-2 rounded-md cursor-pointer text-sm break-all flex gap-2',
                        activeTableId === item.id && 'font-bold bg-gray-300'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveTableId(item.id)
                      }}
                    >
                      <Home />
                      <span className="flex-1 truncate">{item.name}</span>
                      <Delete
                        onClick={() => handleDelete(item.id, item.name)}
                      />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
