"use client";

import { useState, useEffect } from "react";
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

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export function ProjectSidebar({ sections, activeSection, onSectionChange, project }) {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isSmallScreen);
  }, [isSmallScreen]);

  const toggleCollapse = () => {
    if (!isSmallScreen) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const statusDotColor =
    project.status === "active"
      ? "bg-emerald-400"
      : project.status === "paused"
      ? "bg-amber-400"
      : "bg-gray-400";

  const showFull = !isCollapsed;

  return (
    <div
      className={cn(
        "h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300",
        showFull ? "w-64" : "w-16"
      )}
    >
      {!isSmallScreen && (
        <div className="flex justify-end p-3 py-3.5 my-0.5 border-b border-gray-800">
          <button
            onClick={toggleCollapse}
            className="p-1 text-gray-400 justify-center items-center flex hover:text-gray-300 w-full h-full hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
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
                    ? "bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 border-l-2 border-transparent",
                  showFull ? "px-4 gap-3" : "justify-center px-0"
                )}
              >
                <IconComponent
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    activeSection === section.id && "scale-110"
                  )}
                />
                {showFull && <span className="font-medium">{section.label}</span>}
              </button>
            );

            return !showFull ? (
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

      <div className="border-t border-gray-800 p-3">
        {showFull ? (
          <>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString("ru-RU") : "—"}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium",
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
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div>
              <span className={cn("w-2 h-2 rounded-full block", statusDotColor)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}