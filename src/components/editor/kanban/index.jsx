"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { KanbanBoard } from './kanban-board'

// Mock initial data
const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#10b981',
    collapsed: false,
    cards: [
      { id: '1', content: 'Дизайн главной страницы', priority: 'high' },
      { id: '2', content: 'Прототип мобильной версии', priority: 'medium' },
      { id: '3', content: 'Создать логотип', priority: 'low' },
    ]
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: '#f59e0b',
    collapsed: false,
    cards: [
      { id: '4', content: 'Разработка API endpoints', priority: 'high' },
      { id: '5', content: 'Настройка базы данных', priority: 'medium' },
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: '#8b5cf6',
    collapsed: false,
    cards: [
      { id: '6', content: 'Тестирование пользовательского потока', priority: 'high' },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: '#0ea5e9',
    collapsed: false,
    cards: [
      { id: '7', content: 'Создание технического задания', priority: 'medium' },
      { id: '8', content: 'Подготовка среды разработки', priority: 'low' },
    ]
  }
]

export function ProjectKanban({ projectId }) {
  const [columns, setColumns] = useState(initialColumns)
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editingCardId, setEditingCardId] = useState(null)

  // Available colors for columns
  const availableColors = [
    '#10b981', // emerald
    '#0ea5e9', // sky
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#14b8a6', // teal
    '#6366f1', // indigo
  ]

  // Add new column
  const handleAddColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title: 'Новая колонка',
      color: availableColors[Math.floor(Math.random() * availableColors.length)],
      collapsed: false,
      cards: []
    }
    setColumns([newColumn, ...columns])
  }

  // Remove column
  const handleRemoveColumn = (columnId) => {
    setColumns(columns.filter(col => col.id !== columnId))
  }

  // Toggle column collapse
  const toggleColumnCollapse = (columnId) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, collapsed: !col.collapsed } : col
    ))
  }

  // Update column title
  const updateColumnTitle = (columnId, newTitle) => {
    if (!newTitle.trim()) return
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ))
  }

  // Update column color
  const updateColumnColor = (columnId, newColor) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, color: newColor } : col
    ))
  }

  // Add card to column
  const handleAddCard = (columnId) => {
    const newCard = {
      id: `card-${Date.now()}`,
      content: 'Новая задача',
      priority: 'medium'
    }
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, newCard] } 
        : col
    ))
  }

  // Remove card from column
  const handleRemoveCard = (columnId, cardId) => {
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) } 
        : col
    ))
  }

  // Update card content
  const updateCardContent = (columnId, cardId, newContent) => {
    if (!newContent.trim()) return
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { 
            ...col, 
            cards: col.cards.map(card => 
              card.id === cardId ? { ...card, content: newContent } : card
            )
          } 
        : col
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Канбан-доска</h2>
          <p className="text-gray-400 text-sm">
            Управляйте задачами с помощью перетаскивания между колонками
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        columns={columns}
        setColumns={setColumns}              // ✅ New – board updates state directly
        onAddColumn={handleAddColumn}
        onRemoveColumn={handleRemoveColumn}
        onToggleCollapse={toggleColumnCollapse}
        onUpdateColumnTitle={updateColumnTitle}
        onUpdateColumnColor={updateColumnColor}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
        onUpdateCardContent={updateCardContent}
        editingColumnId={editingColumnId}
        setEditingColumnId={setEditingColumnId}
        editingCardId={editingCardId}
        setEditingCardId={setEditingCardId}
        availableColors={availableColors}
      />
    </div>
  )
}