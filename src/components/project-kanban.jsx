"use client"

import { Button } from "@/components/ui/button"
import { Columns, Plus } from "lucide-react"

export function ProjectKanban({ projectId }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Канбан-доска</h2>
          <p className="text-gray-400 text-sm">
            Управляйте задачами с помощью перетаскивания между колонками
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Новая задача
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-emerald-400">To Do</h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">3</span>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 hover:border-emerald-500/30 transition-colors cursor-pointer">
              <div className="font-medium">Дизайн главной страницы</div>
              <div className="text-xs text-gray-400 mt-1">Высокий приоритет</div>
            </div>
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-amber-400">In Progress</h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">2</span>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 hover:border-amber-500/30 transition-colors cursor-pointer">
              <div className="font-medium">Разработка API</div>
              <div className="text-xs text-gray-400 mt-1">Средний приоритет</div>
            </div>
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-400">Done</h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">4</span>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 hover:border-blue-500/30 transition-colors cursor-pointer">
              <div className="font-medium">Планирование проекта</div>
              <div className="text-xs text-gray-400 mt-1">Завершено</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-8 border-t border-gray-800 mt-6">
        <Columns className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Канбан-доска в разработке</h3>
        <p className="text-gray-400 text-sm">
          Drag-and-drop функциональность будет добавлена в следующем обновлении
        </p>
      </div>
    </div>
  )
}