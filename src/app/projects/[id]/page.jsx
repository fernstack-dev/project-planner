"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectInfo } from "@/components/editor/project-info";
import { ProjectKanban } from "@/components/editor/kanban";
import { ProjectSettings } from "@/components/editor/project-settings";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";

const sidebarSections = [
  { id: "info", label: "Информация", icon: "Info" },
  { id: "kanban", label: "Канбан-доска", icon: "Columns" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [project, setProject] = useState(null);
  const [originalProject, setOriginalProject] = useState(null);
  const [activeSection, setActiveSection] = useState("info");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Project not found");
        }
        const data = await res.json();
        setProject(data);
        setOriginalProject(data);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки проекта");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, status, router]);

  const handleProjectUpdate = useCallback(
    (updates) => {
      setProject((prev) => {
        if (!prev) return prev;
        const newProject = { ...prev, ...updates };
        let hasActualChanges = false;
        for (const key in updates) {
          if (JSON.stringify(newProject[key]) !== JSON.stringify(originalProject[key])) {
            hasActualChanges = true;
            break;
          }
        }
        setHasChanges(hasActualChanges);
        return newProject;
      });
    },
    [originalProject]
  );

  const handleSave = async () => {
    if (!hasChanges || !project) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const responseData = await res.json();
      console.log('Save response status:', res.status);
      console.log('Save response data:', responseData);
      if (!res.ok) throw new Error(`Save failed: ${res.status} ${JSON.stringify(responseData)}`);
      setOriginalProject(responseData);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAbort = () => {
    if (hasChanges && window.confirm("Отменить все изменения?")) {
      setProject(originalProject);
      setHasChanges(false);
    }
  };

  const renderActiveSection = () => {
    if (!project) return null;
    switch (activeSection) {
      case "info":
        return <ProjectInfo project={project} onUpdate={handleProjectUpdate} />;
      case "kanban":
        return <ProjectKanban projectId={project.id} />;
      case "settings":
        return <ProjectSettings project={project} onUpdate={handleProjectUpdate} />;
      default:
        return <ProjectInfo project={project} onUpdate={handleProjectUpdate} />;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Загрузка...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">Ошибка: {error}</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Проект не найден</div>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-gray-950">
        <div className="sticky top-14 z-40 border-b border-gray-800 bg-gray-900">
          <div className="px-4 md:px-6 h-12 flex items-center justify-between">
            {/* Left side: back button + project name */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/projects")}
                    className="text-gray-400 hover:text-gray-300 rounded-none"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden md:inline ml-2">К проектам</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Вернуться к списку проектов</p>
                </TooltipContent>
              </Tooltip>

              <div className="hidden md:block h-4 w-px bg-gray-800" />

              <h1 className="text-sm md:text-lg font-semibold truncate text-white">
                {project.name}
              </h1>
            </div>

            {/* Right side: save/cancel actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Unsaved changes indicator */}
              {hasChanges && (
                <>
                  <span className="hidden md:inline text-xs text-amber-400 animate-pulse">
                    Есть несохраненные изменения
                  </span>
                  <span className="md:hidden block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </>
              )}

              {/* Cancel button */}
              {hasChanges && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAbort}
                      className="border-gray-700 hover:bg-gray-800 rounded-none"
                    >
                      <X className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Отменить</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Отменить все изменения</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Save button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent md:mr-2" />
                        <span className="hidden md:inline">Сохраняем...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Сохранить</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{hasChanges ? "Сохранить изменения" : "Нет изменений"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="flex-shrink-0 h-[calc(100vh-3rem)] sticky top-12 border-r border-gray-800 bg-gray-900">
            <ProjectSidebar
              sections={sidebarSections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              project={project}
            />
          </div>
          <div className="flex-1 min-w-0 bg-gray-950">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}