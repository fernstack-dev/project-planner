"use client";

const sampleData = {
  columns: [
    {
      id: "todo",
      title: "To Do",
      color: "#10b981",
      cards: [
        { id: "1", content: "Дизайн главной страницы", priority: "high" },
        { id: "2", content: "Прототип мобильной версии", priority: "medium" },
        { id: "3", content: "Создать логотип", priority: "low" },
        { id: "4", content: "Подготовить техническое задание", priority: "high" },
        { id: "5", content: "Выбрать цветовую схему", priority: "medium" },
      ],
    },
    {
      id: "progress",
      title: "In Progress",
      color: "#f59e0b",
      cards: [
        { id: "6", content: "Разработка API endpoints", priority: "high" },
        { id: "7", content: "Настройка базы данных", priority: "medium" },
        { id: "8", content: "Создание компонентов UI", priority: "high" },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "#0ea5e9",
      cards: [
        { id: "9", content: "Создание технического задания", priority: "medium" },
        { id: "10", content: "Подготовка среды разработки", priority: "low" },
        { id: "11", content: "Исследование конкурентов", priority: "low" },
        { id: "12", content: "Настройка CI/CD", priority: "medium" },
      ],
    },
  ],
};

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  none: "bg-gray-500",
};

export function KanbanMockup() {
  return (
    <div className="h-full w-full overflow-x-auto p-4">
      <div className="flex gap-4 min-w-max md:min-w-0 md:justify-center">
        {sampleData.columns.map((column) => (
          <div key={column.id} className="w-72 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-800 overflow-hidden">
              <div className="p-3 border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: column.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-gray-200">
                        {column.title}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  <span>{column.cards.length} tasks</span>
                </div>
              </div>

              <div className="p-3 flex flex-col gap-2">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-900 border border-gray-800 p-3 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {card.priority !== "none" && (
                            <div
                              className={`w-2 h-2 rounded-full ${
                                priorityColors[card.priority] || "bg-gray-500"
                              }`}
                            />
                          )}
                          <span className="text-sm text-gray-300">{card.content}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {column.cards.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">Нет задач</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}