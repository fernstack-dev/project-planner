"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, Plus, Trash2, Pin, FolderKanban, ChevronDown, ChevronRight, Archive } from "lucide-react";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { StatCards } from './stat-cards';
import { FilterBar } from './filter-bar';
import { ProjectCardGrid } from './project-card-grid';
import { ProjectCardList } from './project-card-list';
import { CreateProjectModal } from "./create-project-modal";

const getStatusBadge = (status) => {
  const statusConfig = {
    active: { label: "Активный", variant: "default" },
    completed: { label: "Завершен", variant: "secondary" },
    paused: { label: "На паузе", variant: "outline" },
    archived: { label: "Архив", variant: "secondary" }
  };
  return statusConfig[status] || statusConfig.active;
};

export function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, projectId: null });
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [expandedCategories, setExpandedCategories] = useState({ "Архив": false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    fetch('/api/projects')
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const projectsWithMembers = data.map(p => ({ ...p, members: p.members ?? 1 }));
        setProjects(projectsWithMembers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

 
  const categories = useMemo(() => {
    const cats = projects
      .filter(p => p.status !== 'archived')
      .map(p => p.category)
      .filter(Boolean);
    return [...new Set(cats)];
  }, [projects]);

  const { pinnedProjects, categorizedProjects, archivedProjects } = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;

      // Exclude archived from main list
      if (project.status === 'archived') return false;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "name") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const pinned = filtered.filter(p => p.pinned);
    const unpinned = filtered.filter(p => !p.pinned);

    const categorized = unpinned.reduce((acc, project) => {
      const category = project.category || "Без категории";
      if (!acc[category]) acc[category] = [];
      acc[category].push(project);
      return acc;
    }, {});

    const archived = projects.filter(p => p.status === 'archived' && (
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    ));

    return { pinnedProjects: pinned, categorizedProjects: categorized, archivedProjects: archived };
  }, [projects, searchQuery, sortBy, sortOrder, selectedCategory]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updated = { ...project, pinned: !project.pinned };
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === projectId ? data : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRightClick = (e, projectId) => {
    e.preventDefault();
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      projectId
    });
  };

  const formatDate = (date) => format(new Date(date), 'dd MMM yyyy', { locale: ru });


  if (loading) {
    return <div className="text-gray-400 text-center py-8">Загрузка проектов...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TooltipProvider>
          <div className="mb-8 pb-4 border-b border-gray-800/50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Мои проекты
            </h1>
            <p className="text-gray-400 text-sm mt-1">Управляйте своими проектами и отслеживайте прогресс</p>
          </div>

          <StatCards projects={projects} />

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск проектов по названию, описанию или категории..."
              className="pl-10 bg-gray-900 border-gray-800 focus:border-emerald-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <FilterBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onNewProject={() => setIsModalOpen(true)}
          />
          <CreateProjectModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />

          {pinnedProjects.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-semibold">Закрепленные проекты</h2>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                  {pinnedProjects.length}
                </span>
              </div>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedProjects.map((project) => {
                    const status = getStatusBadge(project.status);
                    return (
                      <ProjectCardGrid
                        key={project.id}
                        project={project}
                        status={status}
                        onTogglePin={handleTogglePin}
                        onRightClick={handleRightClick}
                        formatDate={formatDate}
                        showCategory={false}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {pinnedProjects.map((project) => {
                    const status = getStatusBadge(project.status);
                    return (
                      <ProjectCardList
                        key={project.id}
                        project={project}
                        status={status}
                        onTogglePin={handleTogglePin}
                        onRightClick={handleRightClick}
                        formatDate={formatDate}
                        showCategory={false}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {Object.keys(categorizedProjects)
            .sort((a, b) => {
              if (a === "Без категории") return -1;
              if (b === "Без категории") return 1;
              return a.localeCompare(b);
            })
            .map((category) => {
              const isExpanded = expandedCategories[category] !== false;
              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-hover:scale-110" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:scale-110" />
                      )}
                      <FolderKanban className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                      <h2 className="text-lg font-semibold group-hover:text-gray-200 transition-colors">{category}</h2>
                    </button>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                      {categorizedProjects[category].length}
                    </span>
                  </div>
                  {isExpanded && (
                    <>
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {categorizedProjects[category].map((project) => {
                            const status = getStatusBadge(project.status);
                            return (
                              <ProjectCardGrid
                                key={project.id}
                                project={project}
                                status={status}
                                onTogglePin={handleTogglePin}
                                onRightClick={handleRightClick}
                                formatDate={formatDate}
                                showCategory={category !== "Без категории"}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {categorizedProjects[category].map((project) => {
                            const status = getStatusBadge(project.status);
                            return (
                              <ProjectCardList
                                key={project.id}
                                project={project}
                                status={status}
                                onTogglePin={handleTogglePin}
                                onRightClick={handleRightClick}
                                formatDate={formatDate}
                                showCategory={category !== "Без категории"}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

          {archivedProjects.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => toggleCategory("Архив")}
                  className="flex items-center gap-2 group"
                >
                  {expandedCategories["Архив"] ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-hover:scale-110" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:scale-110" />
                  )}
                  <Archive className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                  <h2 className="text-lg font-semibold group-hover:text-gray-200 transition-colors">Архив</h2>
                </button>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                  {archivedProjects.length}
                </span>
              </div>
              {expandedCategories["Архив"] && (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {archivedProjects.map((project) => {
                        const status = getStatusBadge(project.status);
                        return (
                          <ProjectCardGrid
                            key={project.id}
                            project={project}
                            status={status}
                            onTogglePin={handleTogglePin}
                            onRightClick={handleRightClick}
                            formatDate={formatDate}
                            showCategory={project.category !== "Без категории"}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {archivedProjects.map((project) => {
                        const status = getStatusBadge(project.status);
                        return (
                          <ProjectCardList
                            key={project.id}
                            project={project}
                            status={status}
                            onTogglePin={handleTogglePin}
                            onRightClick={handleRightClick}
                            formatDate={formatDate}
                            showCategory={project.category !== "Без категории"}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {pinnedProjects.length === 0 && Object.keys(categorizedProjects).length === 0 && archivedProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Проекты не найдены</h3>
              <p className="text-gray-400 text-sm mb-6">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Сбросить фильтры
              </Button>
            </div>
          )}

          {contextMenu.open && (
            <div
              className="fixed z-50 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={() => setContextMenu({ ...contextMenu, open: false })}
            >
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (contextMenu.projectId) handleTogglePin(contextMenu.projectId);
                  setContextMenu({ ...contextMenu, open: false });
                }}
              >
                <Pin className="h-4 w-4" />
                {projects.find(p => p.id === contextMenu.projectId)?.pinned ? "Открепить" : "Закрепить"}
              </button>
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  window.location.href = `/projects/${contextMenu.projectId}`;
                  setContextMenu({ ...contextMenu, open: false });
                }}
              >
                <FolderKanban className="h-4 w-4" />
                Открыть
              </button>
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (contextMenu.projectId) handleDeleteProject(contextMenu.projectId);
                  setContextMenu({ ...contextMenu, open: false });
                }}
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span className="text-rose-400">Удалить</span>
              </button>
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}