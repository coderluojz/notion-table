import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/appStore'
import type { ColumnType } from '@/types/data'
import { useState } from 'react'
import { toast } from 'sonner'

const SelectColumnTypes: { value: ColumnType; label: string }[] = [
  { value: 'Text', label: '文本' },
  { value: 'Number', label: '数字' },
  { value: 'Date', label: '日期' },
  { value: 'Checkbox', label: '复选框' },
  { value: 'SingleSelect', label: '下拉单选' },
  { value: 'MultiSelect', label: '下拉多选' },
]

export function SelectDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    type: ColumnType | ''
  }>({
    name: '',
    type: '',
  })

  const addColumnToActiveTable = useAppStore(
    (state) => state.addColumnToActiveTable
  )

  function handleChange(name: string, value: string) {
    console.log(111, value)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleAdd() {
    if (!formData.name || !formData.type) {
      toast('请填写完整的列信息')
      return
    }
    await addColumnToActiveTable(formData.name, formData.type)
    setOpen(false)
    setFormData({ name: '', type: '' })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>+ 添加列</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加列</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">名称：</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="请输入名称"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">类型：</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(v) => handleChange('type', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SelectColumnTypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleAdd}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
