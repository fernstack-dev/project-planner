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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Map icon names to components
const iconComponents = {
  Info,
  Columns,
  Settings
}

export function ProjectSidebar({ sections, activeSection, onSectionChange, project }) {
  return (
    <div className="h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/50 flex flex-col">
      {/* Project header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color + '20' }}
          >
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: project.color }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold truncate">{project.name}</h3>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {project.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-gray-400 truncate">{project.category}</p>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {project.category}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {sections.map((section) => {
            const IconComponent = iconComponents[section.icon]
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200",
                  activeSection === section.id
                    ? 'bg-emerald-500/10 text-emerald-300 border-l-4 border-emerald-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 border-l-4 border-transparent'
                )}
              >
                {IconComponent && (
                  <IconComponent className={cn(
                    "h-5 w-5 transition-transform",
                    activeSection === section.id ? 'scale-110' : ''
                  )} />
                )}
                <span className="font-medium">{section.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Project stats footer */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{project.tasks}</div>
            <div className="text-xs text-gray-400 mt-1">Задачи</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{project.members}</div>
            <div className="text-xs text-gray-400 mt-1">Участники</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{project.createdAt.toLocaleDateString('ru-RU')}</span>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            project.status === 'active'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : project.status === 'paused'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-gray-800 text-gray-400'
          )}>
            {project.status === 'active' ? 'Активен' : 
             project.status === 'paused' ? 'Пауза' : 'Завершен'}
          </span>
        </div>
      </div>
    </div>
  )
}