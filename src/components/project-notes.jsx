"use client"

import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"

export function ProjectNotes({ projectId }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Заметки проекта</h2>
          <p className="text-gray-400 text-sm">
          Структурированные заметки и документация
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Новая заметка
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/30 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Техническое задание</h3>
              <p className="text-sm text-gray-400">Основные требования и спецификации проекта</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/30 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Встречи и решения</h3>
              <p className="text-sm text-gray-400">Протоколы встреч и принятые решения</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-8 border-t border-gray-800 mt-6">
        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Система заметок в разработке</h3>
        <p className="text-gray-400 text-sm">
          Rich-text редактор и организация заметок будут добавлены в следующем обновлении
        </p>
      </div>
    </div>
  )
}