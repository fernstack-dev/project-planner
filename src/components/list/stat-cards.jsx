import { Card, CardContent } from "@/components/ui/card"
import { Folder, FolderKanban, Pin, Layers } from "lucide-react"

export function StatCards({ projects }) {
  const stats = [
    {
      label: "Всего проектов",
      value: projects.length,
      icon: <Folder className="h-5 w-5 text-emerald-400" />,
      color: "emerald"
    },
    {
      label: "Активные",
      value: projects.filter(p => p.status === 'active').length,
      icon: <FolderKanban className="h-5 w-5 text-blue-400" />,
      color: "blue"
    },
    {
      label: "Закреплено",
      value: projects.filter(p => p.pinned).length,
      icon: <Pin className="h-5 w-5 text-amber-400" />,
      color: "amber"
    },
    {
      label: "Задачи",
      value: projects.reduce((sum, p) => sum + p.tasks, 0),
      icon: <Layers className="h-5 w-5 text-violet-400" />,
      color: "violet"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}