"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { KanbanBoard } from './kanban-board'

// Mock initial data with new fields
const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#10b981',
    collapsed: false,
    cards: [
      {
        id: '1',
        content: 'Дизайн главной страницы',
        priority: 'high',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
      {
        id: '2',
        content: 'Прототип мобильной версии',
        priority: 'medium',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
      {
        id: '3',
        content: 'Создать логотип',
        priority: 'low',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
    ]
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: '#f59e0b',
    collapsed: false,
    cards: [
      {
        id: '4',
        content: 'Разработка API endpoints',
        priority: 'high',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
      {
        id: '5',
        content: 'Настройка базы данных',
        priority: 'medium',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: '#8b5cf6',
    collapsed: false,
    cards: [
      {
        id: '6',
        content: 'Тестирование пользовательского потока',
        priority: 'high',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: '#0ea5e9',
    collapsed: false,
    cards: [
      {
        id: '7',
        content: 'Создание технического задания',
        priority: 'medium',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
      {
        id: '8',
        content: 'Подготовка среды разработки',
        priority: 'low',
        description: '',
        dueDate: null,
        labels: [],
        assignee: '',
        checklist: []
      },
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

  // --- Column operations ---
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

  const handleRemoveColumn = (columnId) => {
    setColumns(columns.filter(col => col.id !== columnId))
  }

  const toggleColumnCollapse = (columnId) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, collapsed: !col.collapsed } : col
    ))
  }

  const updateColumnTitle = (columnId, newTitle) => {
    if (!newTitle.trim()) return
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, title: newTitle } : col
    ))
  }

  const updateColumnColor = (columnId, newColor) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, color: newColor } : col
    ))
  }

  // --- Card operations ---
  const handleAddCard = (columnId) => {
    const newCard = {
      id: `card-${Date.now()}`,
      content: 'Новая задача',
      priority: 'none',
      description: '',
      dueDate: null,
      labels: [],
      assignee: '',
      checklist: []
    }
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ))
    // Automatically open the card for editing
    setEditingCardId(newCard.id)
  }

  const handleRemoveCard = (columnId, cardId) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        : col
    ))
  }

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

  // New card detail operations
  const updateCardPriority = (columnId, cardId, priority) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId ? { ...card, priority } : card
            )
          }
        : col
    ))
  }

  const updateCardDueDate = (columnId, cardId, dueDate) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId ? { ...card, dueDate } : card
            )
          }
        : col
    ))
  }

  const updateCardDescription = (columnId, cardId, description) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId ? { ...card, description } : card
            )
          }
        : col
    ))
  }

  const addCardLabel = (columnId, cardId, label) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, labels: [...card.labels, label] }
                : card
            )
          }
        : col
    ))
  }

  const removeCardLabel = (columnId, cardId, labelId) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, labels: card.labels.filter(l => l.id !== labelId) }
                : card
            )
          }
        : col
    ))
  }

  const updateCardAssignee = (columnId, cardId, assignee) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId ? { ...card, assignee } : card
            )
          }
        : col
    ))
  }

  const addCardChecklistItem = (columnId, cardId, item) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, checklist: [...card.checklist, item] }
                : card
            )
          }
        : col
    ))
  }

  const toggleChecklistItem = (columnId, cardId, itemId) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? {
                    ...card,
                    checklist: card.checklist.map(item =>
                      item.id === itemId
                        ? { ...item, checked: !item.checked }
                        : item
                    )
                  }
                : card
            )
          }
        : col
    ))
  }

  const removeChecklistItem = (columnId, cardId, itemId) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? {
                    ...card,
                    checklist: card.checklist.filter(item => item.id !== itemId)
                  }
                : card
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
        setColumns={setColumns}
        onAddColumn={handleAddColumn}
        onRemoveColumn={handleRemoveColumn}
        onToggleCollapse={toggleColumnCollapse}
        onUpdateColumnTitle={updateColumnTitle}
        onUpdateColumnColor={updateColumnColor}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
        onUpdateCardContent={updateCardContent}
        // New card detail callbacks
        onUpdateCardPriority={updateCardPriority}
        onUpdateCardDueDate={updateCardDueDate}
        onUpdateCardDescription={updateCardDescription}
        onAddCardLabel={addCardLabel}
        onRemoveCardLabel={removeCardLabel}
        onUpdateCardAssignee={updateCardAssignee}
        onAddCardChecklistItem={addCardChecklistItem}
        onToggleChecklistItem={toggleChecklistItem}
        onRemoveChecklistItem={removeChecklistItem}
        // Editing state
        editingColumnId={editingColumnId}
        setEditingColumnId={setEditingColumnId}
        editingCardId={editingCardId}
        setEditingCardId={setEditingCardId}
        availableColors={availableColors}
      />
    </div>
  )
}