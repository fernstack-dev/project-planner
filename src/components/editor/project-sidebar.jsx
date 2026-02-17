"use client";

import { useState } from "react";
import {
  Info,
  Columns,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconComponents = {
  Info,
  Columns,
  Settings,
};

export function ProjectSidebar({ sections, activeSection, onSectionChange, project }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const statusDotColor =
    project.status === "active"
      ? "bg-emerald-400"
      : project.status === "paused"
      ? "bg-amber-400"
      : "bg-gray-400";

  return (
    <div
      className={cn(
        "h-full bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/50 flex flex-col transition-all duration-300 relative overflow-visible",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute right-0 top-4 transform translate-x-1/2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors shadow-lg"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Navigation */}
      <div className="flex-1 pt-16 px-2 overflow-hidden">
        <nav className="space-y-1">
          {sections.map((section) => {
            const IconComponent = iconComponents[section.icon];
            const button = (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center transition-colors h-10",
                  activeSection === section.id
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/30",
                  isCollapsed ? "justify-center px-0" : "px-4 gap-3"
                )}
              >
                <IconComponent
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    activeSection === section.id && "scale-110"
                  )}
                />
                {!isCollapsed && <span className="font-medium">{section.label}</span>}
              </button>
            );

            return isCollapsed ? (
              <TooltipProvider key={section.id}>
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {section.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              button
            );
          })}
        </nav>
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-gray-800/50">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-bold text-emerald-400">{project.tasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-bold text-blue-400">{project.members}</span>
            </div>
            <div className="mt-1">
              <span className={cn("w-2 h-2 rounded-full block", statusDotColor)} />
            </div>
          </div>
        ) : (
          <>
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
                <span>{project.createdAt.toLocaleDateString("ru-RU")}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  project.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : project.status === "paused"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gray-800 text-gray-400"
                )}
              >
                {project.status === "active"
                  ? "Активен"
                  : project.status === "paused"
                  ? "Пауза"
                  : "Завершен"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}