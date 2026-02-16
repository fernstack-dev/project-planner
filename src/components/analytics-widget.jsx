// components/analytics-widget.jsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart3, Star, PieChart, Layers } from "lucide-react"

export function AnalyticsWidget({ projects = [] }) {
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks, 0)
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const avgTasksPerProject = projects.length > 0 ? (totalTasks / projects.length).toFixed(1) : 0

  const projectActivity = [
    { name: "Веб-сайт", changes: 24, color: "bg-emerald-500" },
    { name: "Мобильное приложение", changes: 42, color: "bg-amber-500" },
    { name: "Аналитика", changes: 18, color: "bg-violet-500" },
    { name: "Редизайн", changes: 31, color: "bg-sky-500" },
  ]

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <CardTitle className="text-lg">Аналитика</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/10">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Задач/проект</p>
                  <p className="text-sm font-semibold">{avgTasksPerProject}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Закреплено</p>
                  <p className="text-sm font-semibold">
                    {projects.filter(p => p.pinned).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-violet-500/10">
                  <PieChart className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Всего проектов</p>
                  <p className="text-sm font-semibold">{projects.length}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-sky-500/10">
                  <Layers className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Всего задач</p>
                  <p className="text-sm font-semibold">{totalTasks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project distribution */}
          <div className="pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium mb-2">Распределение проектов</h4>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Активные</span>
                  <span>{activeProjects} ({projects.length > 0 ? Math.round((activeProjects / projects.length) * 100) : 0}%)</span>
                </div>
                <Progress value={projects.length > 0 ? (activeProjects / projects.length) * 100 : 0} className="h-1.5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Завершенные</span>
                  <span>{completedProjects} ({projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%)</span>
                </div>
                <Progress value={projects.length > 0 ? (completedProjects / projects.length) * 100 : 0} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Tasks by project */}
          <div className="pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium mb-2">Задачи по проектам</h4>
            <div className="space-y-2">
              {projectActivity.map((project, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${project.color}`} />
                    <span className="truncate max-w-[100px]">{project.name}</span>
                  </div>
                  <span className="font-medium">{project.changes} задач</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}