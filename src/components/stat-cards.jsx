import { Card, CardContent } from "@/components/ui/card"
import { Folder, FolderKanban, Pin, Layers } from "lucide-react"

export function StatCards({ projects }) {
  const stats = [
    {
      label: "Всего проектов",
      value: projects.length,
      icon: <Folder className="h-10 w-10 text-emerald-400" />,
    },
    {
      label: "Активные",
      value: projects.filter(p => p.status === 'active').length,
      icon: <FolderKanban className="h-10 w-10 text-emerald-400" />,
    },
    {
      label: "Закреплено",
      value: projects.filter(p => p.pinned).length,
      icon: <Pin className="h-10 w-10 text-emerald-400" />,
    },
    {
      label: "Задачи",
      value: projects.reduce((sum, p) => sum + p.tasks, 0),
      icon: <Layers className="h-10 w-10 text-emerald-400" />,
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}