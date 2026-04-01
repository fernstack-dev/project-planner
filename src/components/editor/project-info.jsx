"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Layers, Users, LayoutGrid, CheckCircle2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Активный", variant: "default", color: "text-emerald-400" },
  completed: { label: "Завершен", variant: "secondary", color: "text-blue-400" },
  paused: { label: "На паузе", variant: "outline", color: "text-amber-400" },
  archived: { label: "Архив", variant: "secondary", color: "text-gray-400" },
};

export function ProjectInfo({ project, onUpdate }) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    category: project.category || '',
    status: project.status || 'active',
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const categoryInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const saveTimeoutRef = useRef({});
  const pendingUpdatesRef = useRef({});

  useEffect(() => {
    fetch('/api/projects/categories')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
      .then(data => {
        setAvailableCategories(data.sort());
        setLoadingCategories(false);
      })
      .catch(err => {
        console.error('Error loading categories:', err);
        setLoadingCategories(false);
      });
  }, []);

  useEffect(() => {
    setFormData({
      name: project.name || '',
      description: project.description || '',
      category: project.category || '',
      status: project.status || 'active',
    });
  }, [project]);

  const updateSuggestions = (input) => {
    if (input.trim()) {
      const searchTerm = input.toLowerCase();
      const suggestions = availableCategories
        .filter(cat => cat.toLowerCase().includes(searchTerm))
        .slice(0, 5);
      setSuggestedCategories(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSuggestedCategories([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSave = useCallback((field, value) => {
    if (saveTimeoutRef.current[field]) {
      clearTimeout(saveTimeoutRef.current[field]);
    }
    pendingUpdatesRef.current[field] = value;

    saveTimeoutRef.current[field] = setTimeout(() => {
      const currentValue = pendingUpdatesRef.current[field];
      if (currentValue !== undefined) {
        onUpdate({ [field]: currentValue });
        delete pendingUpdatesRef.current[field];
      }
    }, 500);
  }, [onUpdate]);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(field, value);

    if (field === 'category') {
      updateSuggestions(value);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    onUpdate({ category });
    setShowSuggestions(false);
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
    onUpdate({ status: value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestedCategories.length > 0) {
      handleCategorySelect(suggestedCategories[0]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (formData.category.trim()) {
      updateSuggestions(formData.category);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const quickCategories = availableCategories.slice(0, 4);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 pt-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-gray-300">Название проекта</Label>
        <Input
          id="project-name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Введите название проекта"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description" className="text-gray-300">Описание</Label>
        <Textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="min-h-[120px] bg-gray-900 border-gray-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
          placeholder="Опишите цель проекта, задачи, ключевые моменты..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-status" className="text-gray-300">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Статус
          </div>
        </Label>
        <Select value={formData.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Выберите статус" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {Object.entries(statusConfig).map(([value, config]) => (
              <SelectItem
                key={value}
                value={value}
                className="text-gray-300 focus:bg-gray-700 focus:text-white"
              >
                <span className={cn("font-medium", config.color)}>
                  {config.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Статус влияет на отображение в списке проектов
        </p>
      </div>

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
                handleChange('category', '');
                categoryInputRef.current?.focus();
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
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Введите категорию или выберите из списка"
          />

          {showSuggestions && suggestedCategories.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 z-10"
            >
              {suggestedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{category}</span>
                  <span className="text-xs text-gray-500">Enter</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {quickCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-gray-500">Быстрый выбор:</span>
            {quickCategories.map((category) => (
              <Button
                key={category}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
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
        )}
      </div>

      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">СТАТИСТИКА ПРОЕКТА</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Задачи</p>
                  <p className="text-xl font-bold">{project.tasks ?? 0}</p>
                </div>
                <Layers className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Участники</p>
                  <p className="text-xl font-bold">{project.members ?? 0}</p>
                </div>
                <Users className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Доски</p>
                  <p className="text-xl font-bold">{project.boards ?? 0}</p>
                </div>
                <LayoutGrid className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Завершено</p>
                  <p className="text-xl font-bold">{project.completedTasks ?? 0}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}