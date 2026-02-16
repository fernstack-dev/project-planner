import { Card, CardContent, CardDescription, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, User, FolderKanban, Folder, Pin, PinOff } from "lucide-react"

export function ProjectCardGrid({ 
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
        <Card 
          className="bg-gray-900 border-gray-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group cursor-pointer relative h-full"
          onClick={() => window.location.href = `/projects/${project.id}`}
          onContextMenu={(e) => onRightClick(e, project.id)}
        >
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full ${project.color} flex-shrink-0 mt-1`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate">
                    {project.name}
                  </h3>
                </div>
              </div>
              
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
            </div>
            
            <CardDescription className="text-gray-400 text-xs line-clamp-2 mb-2">
              {project.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-2 px-3">
            {showCategory && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <Folder className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{project.category}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{project.category}</TooltipContent>
              </Tooltip>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{getParticipantText(project.members)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Участники</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      <span className="text-xs">{project.tasks}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Задачи</TooltipContent>
                </Tooltip>
              </div>
              {/* Status badge moved here as requested */}
              <Badge variant={status.variant} className="text-xs px-1.5 py-0 h-5 w-fit">
                {status.label}
              </Badge>
            </div>
          </CardContent>

          <CardFooter className="pt-2 px-3 pb-3 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between w-full text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                <span className="text-xs">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span className="text-xs">{formatDate(project.updatedAt)}</span>
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