// components/filter-bar.jsx - UPDATED VERSION
"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Grid, Menu, ArrowUpDown, Folder, Plus } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function FilterBar({ 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder, 
  selectedCategory, 
  setSelectedCategory, 
  categories,
  viewMode,
  setViewMode
}) {
  const [openSort, setOpenSort] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)

  const sortOptions = [
    { value: "updatedAt", label: "Последнее изменение" },
    { value: "createdAt", label: "Дата создания" },
    { value: "name", label: "Имя" }
  ]

  const orderOptions = [
    { value: "desc", label: "Новые первыми" },
    { value: "asc", label: "Старые первыми" }
  ]

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* New Project Button */}
        <Link href="/projects/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm h-9">
            <Plus className="h-4 w-4" />
            Новый проект
          </Button>
        </Link>

        {/* Sort dropdown */}
        <DropdownMenu open={openSort} onOpenChange={setOpenSort}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-9 bg-gray-900 border-gray-800 hover:bg-gray-850">
              <ArrowUpDown className="h-3 w-3" />
              {sortOptions.find(opt => opt.value === sortBy)?.label || "Сортировка"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-gray-900 border-gray-800">
            <DropdownMenuLabel>Сортировать по:</DropdownMenuLabel>
            {sortOptions.map(option => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? "bg-gray-800" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Порядок:</DropdownMenuLabel>
            {orderOptions.map(option => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => setSortOrder(option.value)}
                className={sortOrder === option.value ? "bg-gray-800" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category dropdown */}
        <DropdownMenu open={openCategory} onOpenChange={setOpenCategory}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-9 bg-gray-900 border-gray-800 hover:bg-gray-850">
              <Folder className="h-3 w-3" />
              {selectedCategory === "all" ? "Все категории" : selectedCategory}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800">
            <DropdownMenuItem 
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-gray-800" : ""}
            >
              Все категории
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map(category => (
              <DropdownMenuItem 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gray-800" : ""}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* View toggle */}
      <div className="flex items-center h-9 gap-3">
        <div className="flex items-center gap-0 border border-gray-800 rounded-lg overflow-hidden">
            <button
            className={`px-3 py-1.5 flex items-center justify-center h-full transition-colors rounded-l-lg ${viewMode === "grid" ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-850"}`}
            onClick={() => setViewMode("grid")}
            >
            <Grid className="h-4 w-4 text-gray-300" />
            </button>
            <button
            className={`px-3 py-1.5 flex items-center justify-center h-full transition-colors rounded-r-lg ${viewMode === "list" ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-850"}`}
            onClick={() => setViewMode("list")}
            >
            <Menu className="h-4 w-4 text-gray-300" />
            </button>
        </div>
      </div>
    </div>
  )
}