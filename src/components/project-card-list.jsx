import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, User, FolderKanban, Folder, Pin, PinOff } from "lucide-react"

export function ProjectCardList({ 
  project, 
  status, 
  onTogglePin, 
  onRightClick, 
  formatDate, 
  getParticipantText, 
  showCategory 
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="bg-gray-900 border-b border-gray-800 hover:bg-gray-850 transition-all duration-300 group cursor-pointer relative"
          onClick={() => window.location.href = `/projects/${project.id}`}
          onContextMenu={(e) => onRightClick(e, project.id)}
        >
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Pin button - Fixed hover */}
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

                <div className={`w-2 h-2 rounded-full ${project.color} flex-shrink-0`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate">
                      {project.name}
                    </h3>
                    <Badge variant={status.variant} className="text-xs px-1.5 py-0 h-5 flex-shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {project.description}
                  </p>
                </div>

                {showCategory && (
                  <div className="hidden md:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-4">
                    <Folder className="h-3 w-3" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[100px]">{project.category}</span>
                      </TooltipTrigger>
                      <TooltipContent>{project.category}</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{getParticipantText(project.members)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Участники</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        <span>{project.tasks}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Задачи</TooltipContent>
                  </Tooltip>
                </div>

                <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 ml-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile view: show below */}
            <div className="md:hidden mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {showCategory && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      <span>{project.category}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{project.category}</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{getParticipantText(project.members)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Участники</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    <span>{project.tasks}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Задачи</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(project.updatedAt)}</span>
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