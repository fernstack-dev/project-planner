"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ProjectSidebar } from '@/components/editor/project-sidebar'
import { ProjectInfo } from '@/components/editor/project-info'
import { ProjectKanban } from '@/components/editor/kanban'
import { ProjectSettings } from '@/components/editor/project-settings'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, X } from "lucide-react"
import { useRouter } from 'next/navigation'

// Mock project data
const mockProject = {
  id: '1',
  name: 'Корпоративный веб-сайт',
  description: 'Разработка современного корпоративного сайта с CMS',
  category: 'Веб-разработка',
  color: '#10b981',
  pinned: true,
  status: 'active',
  tasks: 24,
  members: 3,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-28'),
  settings: {
    notifications: true,
    public: false,
    autoSave: true
  }
}

// Only the three tabs we need
const sidebarSections = [
  { id: 'info', label: 'Информация', icon: 'Info' },
  { id: 'kanban', label: 'Канбан-доска', icon: 'Columns' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' }
]

export default function ProjectEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(mockProject)
  const [originalProject, setOriginalProject] = useState(mockProject)
  const [activeSection, setActiveSection] = useState('info')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveQueue, setSaveQueue] = useState([])
  const saveQueueRef = useRef([])

  // Load project data
  useEffect(() => {
    console.log('Loading project:', params.id)
    setOriginalProject(mockProject)
    setProject(mockProject)
  }, [params.id])

  // Handle project updates with better change detection
  const handleProjectUpdate = useCallback((updates) => {
    setProject(prev => {
      const newProject = { ...prev, ...updates }
      
      // Check if there are any actual changes
      let hasActualChanges = false
      for (const key in updates) {
        if (JSON.stringify(newProject[key]) !== JSON.stringify(originalProject[key])) {
          hasActualChanges = true
          break
        }
      }
      
      // Only update hasChanges if there are actual differences
      if (hasActualChanges !== hasChanges) {
        setHasChanges(hasActualChanges)
      }
      
      return newProject
    })
  }, [originalProject, hasChanges])

  const handleSave = async () => {
    if (!hasChanges) return
    
    setIsSaving(true)
    try {
      // Mock save - in reality, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update the original project reference after successful save
      setOriginalProject(project)
      setHasChanges(false)
      
      console.log('Project saved:', project)
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAbort = () => {
    if (hasChanges && window.confirm('Отменить все изменения?')) {
      setProject(originalProject)
      setHasChanges(false)
    }
  }

  // Render active section component
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'info':
        return <ProjectInfo project={project} onUpdate={handleProjectUpdate} />
      case 'kanban':
        return <ProjectKanban projectId={project.id} />
      case 'settings':
        return <ProjectSettings project={project} onUpdate={handleProjectUpdate} />
      default:
        return <ProjectInfo project={project} onUpdate={handleProjectUpdate} />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top bar with back and save */}
      <div className="sticky top-14 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/projects')}
              className="text-gray-400 hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              К проектам
            </Button>
            <div className="h-4 w-px bg-gray-800" />
            <h1 className="text-lg font-semibold truncate max-w-md">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-amber-400 animate-pulse">
                Есть несохраненные изменения
              </span>
            )}
            {hasChanges && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAbort}
                className="border-gray-700 hover:bg-gray-800"
              >
                <X className="h-3 w-3 mr-2" />
                Отменить
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Сохраняем...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex">
        {/* Material Sidebar - fixed width, attached to left */}
        <div className="flex-shrink-0 h-[calc(100vh-3rem)] sticky top-12">
        <ProjectSidebar
          sections={sidebarSections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          project={project}
        />
      </div>

        {/* Main content area - takes remaining space, no background container */}
        <div className="flex-1 min-w-0 p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  )
}