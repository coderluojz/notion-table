import { createTable } from './services/db'
import { generateId } from './types/data'

export default function App() {
  function handleCreateTable() {
    createTable({
      id: generateId(),
      name: '我的表格',
      tables: [],
    })
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Notion Table</h1>
      <button onClick={handleCreateTable}>创建表格</button>
    </div>
  )
}
