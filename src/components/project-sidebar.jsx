"use client"

import { 
  Users, 
  Calendar, 
  FileText, 
  Link, 
  Download,
  Info,
  Columns,
  Activity,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

// Map icon names to components
const iconComponents = {
  Info,
  Columns,
  FileText,
  Activity,
  Settings
}

export function ProjectSidebar({ sections, activeSection, onSectionChange, project }) {
  return (
    <div className="space-y-6">
      {/* Navigation sections */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">НАВИГАЦИЯ</h3>
        <nav className="space-y-1">
          {sections.map((section) => {
            const IconComponent = iconComponents[section.icon]
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  activeSection === section.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Project info widget */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">ПРОЕКТ</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Статус</span>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              project.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : project.status === 'paused'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-800 text-gray-400'
            )}>
              {project.status === 'active' ? 'Активный' : 
               project.status === 'paused' ? 'На паузе' : 'Завершен'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Задачи</span>
            <span className="text-gray-300 font-medium">{project.tasks}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Участники:</span>
            <span className="text-gray-300 font-medium">{project.members}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Создан:</span>
            <span className="text-gray-300">
              {project.createdAt.toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">БЫСТРЫЕ ДЕЙСТВИЯ</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
            <Link className="h-4 w-4" />
            Пригласить участников
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
            <FileText className="h-4 w-4" />
            Экспорт данных
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            Архив проекта
          </button>
        </div>
      </div>
    </div>
  )
}