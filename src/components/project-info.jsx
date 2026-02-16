"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tag } from "lucide-react"

// Mock categories for suggestions
const mockCategories = [
  'Веб-разработка',
  'Мобильная разработка',
  'Дизайн',
  'Аналитика',
  'Маркетинг',
  'Контент',
  'Исследования',
  'Тестирование',
  'Документация',
  'Планирование'
]

export function ProjectInfo({ project, onUpdate }) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    category: project.category || ''
  })

  const [suggestedCategories, setSuggestedCategories] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const categoryInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Update form when project changes
  useEffect(() => {
    setFormData({
      name: project.name || '',
      description: project.description || '',
      category: project.category || ''
    })
  }, [project])

  // Find category suggestions
  const updateSuggestions = (input) => {
    if (input.trim()) {
      const searchTerm = input.toLowerCase()
      const suggestions = mockCategories
        .filter(cat => cat.toLowerCase().includes(searchTerm))
        .slice(0, 5)
      setSuggestedCategories(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setSuggestedCategories([])
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    updateSuggestions(formData.category)
  }, [formData.category])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        categoryInputRef.current && 
        !categoryInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Auto-save on change
    setTimeout(() => {
      onUpdate({ [field]: value })
    }, 100)
  }

  const handleCategorySelect = (category) => {
    handleChange('category', category)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestedCategories.length > 0) {
      handleCategorySelect(suggestedCategories[0])
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Информация о проекте</h2>
        <p className="text-gray-400 text-sm">
          Основные данные проекта. Все изменения сохраняются автоматически.
        </p>
      </div>

      {/* Project name */}
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-gray-300">Название проекта</Label>
        <Input
          id="project-name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="bg-gray-800/50 border-gray-700"
          placeholder="Введите название проекта"
        />
      </div>

      {/* Project description */}
      <div className="space-y-2">
        <Label htmlFor="project-description" className="text-gray-300">Описание</Label>
        <Textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="min-h-[120px] bg-gray-800/50 border-gray-700"
          placeholder="Опишите цель проекта, задачи, ключевые моменты..."
        />
      </div>

      {/* Category with suggestions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="project-category" className="text-gray-300">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Категория
            </div>
          </Label>
          {formData.category && (
            <button
              type="button"
              onClick={() => {
                handleChange('category', '')
                categoryInputRef.current?.focus()
              }}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Очистить
            </button>
          )}
        </div>
        
        <div className="relative" ref={categoryInputRef}>
          <Input
            id="project-category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            onFocus={() => formData.category && updateSuggestions(formData.category)}
            onKeyDown={handleKeyDown}
            className="bg-gray-800/50 border-gray-700"
            placeholder="Введите категорию или выберите из списка"
          />
          
          {/* Category suggestions dropdown */}
          {showSuggestions && suggestedCategories.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10"
            >
              {suggestedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
                >
                  <span>{category}</span>
                  <span className="text-xs text-gray-500">Enter</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick category buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs text-gray-500">Быстрый выбор:</span>
          {mockCategories.slice(0, 4).map((category) => (
            <Button
              key={category}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "text-xs border-gray-700 hover:border-emerald-500/50",
                formData.category === category 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'hover:text-emerald-400'
              )}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">СТАТИСТИКА ПРОЕКТА</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-400">{project.tasks}</div>
            <div className="text-xs text-gray-400">Задач</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{project.members}</div>
            <div className="text-xs text-gray-400">Участников</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-400">
              {Math.floor((project.tasks || 0) / 7)}
            </div>
            <div className="text-xs text-gray-400">Задач/неделю</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-violet-400">
              {Math.floor((project.members || 1) * 1.5)}
            </div>
            <div className="text-xs text-gray-400">Активность</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for class names
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}