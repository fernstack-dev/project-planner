"use client"

import { Activity } from "lucide-react"

export function ProjectActivity({ projectId }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Активность проекта</h2>
        <p className="text-gray-400 text-sm">
          История изменений и активность участников
        </p>
      </div>

      <div className="space-y-4">
        {[
          { user: 'Алексей Петров', action: 'создал задачу', time: '2 часа назад', type: 'task' },
          { user: 'Мария Иванова', action: 'обновила описание', time: '5 часов назад', type: 'update' },
          { user: 'Иван Сидоров', action: 'загрузил файл', time: '1 день назад', type: 'file' },
          { user: 'Алексей Петров', action: 'изменил статус', time: '2 дня назад', type: 'status' },
          { user: 'Система', action: 'авто-сохранение', time: '3 дня назад', type: 'system' },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/30 border border-gray-800 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              item.type === 'task' ? 'bg-emerald-500' :
              item.type === 'update' ? 'bg-blue-500' :
              item.type === 'file' ? 'bg-amber-500' :
              item.type === 'status' ? 'bg-violet-500' : 'bg-gray-500'
            }`} />
            <div className="flex-1">
              <span className="font-medium">{item.user}</span>
              <span className="text-gray-400"> {item.action}</span>
            </div>
            <span className="text-xs text-gray-500">{item.time}</span>
          </div>
        ))}
      </div>

      <div className="text-center py-8 border-t border-gray-800 mt-6">
        <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Подробная активность в разработке</h3>
        <p className="text-gray-400 text-sm">
          Графики активности и фильтрация по участникам будут добавлены в следующем обновлении
        </p>
      </div>
    </div>
  )
}