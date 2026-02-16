// app/page.js - FIXED VERSION
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, ArrowRight, FolderKanban, Calendar, FileText } from "lucide-react"

export default function Home() {
  const features = [
    { icon: <FolderKanban />, title: "Канбан доски", description: "Организуйте задачи визуально" },
    { icon: <Calendar />, title: "Календарь", description: "Планируйте сроки и дедлайны" },
    { icon: <FileText />, title: "Заметки", description: "Структурируйте идеи и документацию" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-6">
            <Rocket className="h-10 w-10 text-emerald-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              ProjectPlanner
            </h1>
          </div>

          <h2 className="text-3xl font-semibold mb-6 text-gray-200">
            Планируйте проекты без стресса
          </h2>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Современный планировщик проектов, который помогает фокусироваться на важном. 
            Канбан-доски, задачи, заметки и календарь в одном месте.
          </p>
          
          <Card className="max-w-md mx-auto bg-gray-800/50 border-gray-700 mb-12">
            <CardHeader>
              <CardTitle className="text-center">Начните прямо сейчас</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-center">Создайте свой первый проект за 30 секунд</p>
              <Button asChild className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/projects">
                  Перейти к проектам
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700 hover:border-emerald-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Проектов создано" },
              { value: "99.9%", label: "Время работы" },
              { value: "24/7", label: "Поддержка" },
              { value: "0 ₽", label: "Начальная цена" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}