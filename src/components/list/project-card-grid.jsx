import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, User, FolderKanban, Folder, Pin, PinOff } from "lucide-react"

export function ProjectCardGrid({ 
  project, 
  status, 
  onTogglePin, 
  onRightClick, 
  formatDate, 
  showCategory 
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className="bg-gray-900/50 border border-gray-800 hover:border-emerald-500/40 hover:bg-gray-900/80 transition-all duration-300 group cursor-pointer relative h-full backdrop-blur-sm"
          onClick={() => window.location.href = `/projects/${project.id}`}
          onContextMenu={(e) => onRightClick(e, project.id)}
        >
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: project.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate">
                    {project.name}
                  </h3>
                  {showCategory && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{project.category}</p>
                  )}
                </div>
              </div>
              
              {/* Pin button with original hover effect */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(project.id)
                }}
                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0 group/pin"
              >
                {project.pinned ? (
                  <>
                    <Pin className="h-3.5 w-3.5 text-amber-400 fill-amber-400 group-hover/pin:hidden" />
                    <PinOff className="h-3.5 w-3.5 text-gray-400 hidden group-hover/pin:block" />
                  </>
                ) : (
                  <>
                    <PinOff className="h-3.5 w-3.5 text-gray-400 group-hover/pin:hidden" />
                    <Pin className="h-3.5 w-3.5 text-amber-400 hidden group-hover/pin:block" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-400 line-clamp-2">
              {project.description}
            </p>
          </CardHeader>

          <CardContent className="pb-3 px-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={status.variant} className={`text-xs px-2 py-0 h-5 border border-gray-700 ${
                status.variant === 'default' ? 'text-white' : 
                status.variant === 'secondary' ? 'text-gray-300' : 
                'text-gray-400'
              }`}>
                {status.label}
              </Badge>
              
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-medium">{project.members}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Участники</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-medium">{project.tasks}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Задачи</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-3 px-4 pb-4 border-t border-gray-800/50 bg-gray-900/30">
            <div className="flex items-center justify-between w-full text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">Создан:</span>
                </div>
                <span className="text-xs font-medium">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Обновлено</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top">
        Нажмите для открытия или правой кнопкой для меню
      </TooltipContent>
    </Tooltip>
  )
}