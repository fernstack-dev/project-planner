"use client"

import { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search, Plus, Trash2, Pin, FolderKanban } from "lucide-react"
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { StatCards } from './list/stat-cards'
import { FilterBar } from './list/filter-bar'
import { ProjectCardGrid } from './list/project-card-grid'
import { ProjectCardList } from './list/project-card-list'

// Mock data for projects
const initialProjects = [
  {
    id: 1,
    name: "Корпоративный веб-сайт",
    description: "Разработка современного корпоративного сайта с CMS",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-28'),
    category: "Веб-разработка",
    status: "active",
    pinned: true,
    color: "#10b981",
    members: 3,
    tasks: 24
  },
  {
    id: 2,
    name: "Мобильное приложение",
    description: "Кроссплатформенное приложение на React Native",
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-30'),
    category: "Мобильная разработка",
    status: "active",
    pinned: true,
    color: "#f59e0b",
    members: 4,
    tasks: 42
  },
  {
    id: 3,
    name: "Система аналитики",
    description: "Дашборд и аналитика пользовательских данных",
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
    category: "Аналитика",
    status: "completed",
    pinned: false,
    color: "#8b5cf6",
    members: 2,
    tasks: 18
  },
  {
    id: 4,
    name: "Редизайн платформы",
    description: "Обновление UI/UX существующей платформы",
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-29'),
    category: "Дизайн",
    status: "active",
    pinned: false,
    color: "#0ea5e9",
    members: 3,
    tasks: 31
  },
  {
    id: 5,
    name: "API сервис",
    description: "Микросервисная архитектура для обработки данных",
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-27'),
    category: "",
    status: "paused",
    pinned: false,
    color: "#f43f5e",
    members: 1,
    tasks: 15
  },
  {
    id: 6,
    name: "Чат-бот",
    description: "ИИ-ассистент для поддержки клиентов",
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-31'),
    category: "Искусственный интеллект",
    status: "active",
    pinned: false,
    color: "#06b6d4",
    members: 2,
    tasks: 22
  }
]

const getStatusBadge = (status) => {
  const statusConfig = {
    active: { label: "Активный", variant: "default" },
    completed: { label: "Завершен", variant: "secondary" },
    paused: { label: "На паузе", variant: "outline" }
  }
  return statusConfig[status] || statusConfig.active
}

export function ProjectsList() {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, projectId: null })
  const [sortBy, setSortBy] = useState("updatedAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  // Get unique categories from projects
  const categories = useMemo(() => {
    const cats = projects.map(p => p.category).filter(Boolean)
    return [...new Set(cats)]
  }, [projects])

  const { pinnedProjects, categorizedProjects } = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "name") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    const pinned = filtered.filter(p => p.pinned)
    const unpinned = filtered.filter(p => !p.pinned)

    const categorized = unpinned.reduce((acc, project) => {
      const category = project.category || "Без категории"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(project)
      return acc
    }, {})

    return { pinnedProjects: pinned, categorizedProjects: categorized }
  }, [projects, searchQuery, sortBy, sortOrder, selectedCategory])

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const handleTogglePin = (projectId) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, pinned: !p.pinned } : p
    ))
  }

  const handleRightClick = (e, projectId) => {
    e.preventDefault()
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      projectId
    })
  }

  const formatDate = (date) => {
    return format(date, 'dd MMM yyyy', { locale: ru })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TooltipProvider>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Мои проекты</h1>
            </div>

            {/* Stats Cards */}
            <StatCards projects={projects} />

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск проектов по названию, описанию или категории..."
                className="pl-10 bg-gray-900 border-gray-800 focus:border-emerald-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Bar */}
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
            />
          </div>

          {/* Pinned Projects Section */}
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
                    const status = getStatusBadge(project.status)
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
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {pinnedProjects.map((project) => {
                    const status = getStatusBadge(project.status)
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
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Categorized Projects */}
          {Object.keys(categorizedProjects)
            .sort((a, b) => {
              if (a === "Без категории") return -1
              if (b === "Без категории") return 1
              return a.localeCompare(b)
            })
            .map((category) => (
              <div key={category} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FolderKanban className="h-4 w-4 text-gray-400" />
                  <h2 className="text-lg font-semibold">{category}</h2>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                    {categorizedProjects[category].length}
                  </span>
                </div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categorizedProjects[category].map((project) => {
                      const status = getStatusBadge(project.status)
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
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorizedProjects[category].map((project) => {
                      const status = getStatusBadge(project.status)
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
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          }

          {/* Empty state */}
          {pinnedProjects.length === 0 && Object.keys(categorizedProjects).length === 0 && (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Проекты не найдены</h3>
              <p className="text-gray-400 text-sm mb-6">Попробуйте изменить поисковый запрос или фильтры</p>
              <Button 
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }} 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Сбросить фильтры
              </Button>
            </div>
          )}

          {/* Right-click Context Menu */}
          {contextMenu.open && (
            <div 
              className="fixed z-50 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={() => setContextMenu({ ...contextMenu, open: false })}
            >
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2"
                onClick={() => {
                  if (contextMenu.projectId) {
                    handleTogglePin(contextMenu.projectId)
                  }
                  setContextMenu({ ...contextMenu, open: false })
                }}
              >
                <Pin className="h-4 w-4" />
                {projects.find(p => p.id === contextMenu.projectId)?.pinned ? "Открепить" : "Закрепить"}
              </button>
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2"
                onClick={() => {
                  window.location.href = `/projects/${contextMenu.projectId}`
                  setContextMenu({ ...contextMenu, open: false })
                }}
              >
                <FolderKanban className="h-4 w-4" />
                Открыть
              </button>
              <button
                className="w-full px-4 py-2 text-sm hover:bg-gray-800 text-left flex items-center gap-2"
                onClick={() => {
                  if (contextMenu.projectId) handleDeleteProject(contextMenu.projectId)
                  setContextMenu({ ...contextMenu, open: false })
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
  )
}