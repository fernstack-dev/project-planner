import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, User, FolderKanban, Folder, Pin, PinOff } from "lucide-react"

export function ProjectCardList({ 
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
        <div 
          className="bg-gray-900/50 border-b border-gray-800/50 hover:bg-gray-900/80 transition-all duration-300 group cursor-pointer relative backdrop-blur-sm"
          onClick={() => window.location.href = `/projects/${project.id}`}
          onContextMenu={(e) => onRightClick(e, project.id)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
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

                {/* Color indicator - same size as grid */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: project.color }}
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate">
                      {project.name}
                    </h3>
                    <Badge variant={status.variant} className={`text-xs px-2 py-0 h-5 flex-shrink-0 border border-gray-700 ${
                      status.variant === 'default' ? 'text-white' : 
                      status.variant === 'secondary' ? 'text-gray-300' : 
                      'text-gray-400'
                    }`}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {project.description}
                  </p>
                </div>

                {/* Category - desktop */}
                {showCategory && (
                  <div className="hidden md:block flex-shrink-0 ml-4">
                    <Badge variant="outline" className="text-xs border-gray-700">
                      {project.category}
                    </Badge>
                  </div>
                )}

                {/* Stats - desktop */}
                <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{project.members}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Участники</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <FolderKanban className="h-3.5 w-3.5" />
                        <span className="font-medium">{project.tasks}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Задачи</TooltipContent>
                  </Tooltip>
                </div>

                {/* Date - desktop */}
                <div className="hidden md:flex items-center gap-3 text-sm text-gray-400 ml-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile view */}
            <div className="md:hidden mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {showCategory && (
                <Badge variant="outline" className="text-xs border-gray-700">
                  {project.category}
                </Badge>
              )}
              
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium">{project.members}</span>
                <span className="text-xs">участников</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5" />
                <span className="font-medium">{project.tasks}</span>
                <span className="text-xs">задач</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        Нажмите для открытия или правой кнопкой для меню
      </TooltipContent>
    </Tooltip>
  )
}