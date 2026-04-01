import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, User, FolderKanban, Folder, Pin, PinOff } from "lucide-react";

export function ProjectCardList({
  project,
  status,
  onTogglePin,
  onRightClick,
  formatDate,
  showCategory,
}) {
  const getParticipantText = (count) => {
    if (count == null) return "0";
    if (count === 0) return "0";
    if (count === 1) return "1";
    return `${count}`;
  };

  const getCategoryColor = (category) => {
  if (!category || category === "Без категории") return "bg-gray-500";
  const colors = [
    "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-violet-500",
    "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
    "bg-cyan-500", "bg-fuchsia-500"
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
};

  const categoryColor = getCategoryColor(project.category || "Без категории");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="bg-gray-900 border-b border-gray-800 hover:bg-gray-850 transition-all duration-300 group cursor-pointer relative"
          onClick={() => (window.location.href = `/projects/${project.id}`)}
          onContextMenu={(e) => onRightClick(e, project.id)}
        >
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(project.id);
                  }}
                  className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0 group/pin cursor-pointer"
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

                <div className={`w-4 h-4 rounded-none ${categoryColor} flex-shrink-0 mt-0`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate cursor-pointer">
                      {project.name}
                    </h3>
                    <Badge variant={status.variant} className="text-xs px-1.5 py-0 h-5 flex-shrink-0 cursor-pointer">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 cursor-pointer">{project.description}</p>
                </div>

                <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer">
                        <User className="h-3 w-3" />
                        <span>{getParticipantText(project.members)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Участники</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer">
                        <FolderKanban className="h-3 w-3" />
                        <span>{project.tasks}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Задачи</TooltipContent>
                  </Tooltip>
                </div>

                <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 ml-4">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {showCategory && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <Folder className="h-3 w-3" />
                      <span>{project.category}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{project.category}</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <User className="h-3 w-3" />
                    <span>{getParticipantText(project.members)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Участники</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <FolderKanban className="h-3 w-3" />
                    <span>{project.tasks}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Задачи</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1 cursor-pointer">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer">
                <Clock className="h-3 w-3" />
                <span>{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">Нажмите для открытия или правой кнопкой для меню</TooltipContent>
    </Tooltip>
  );
}