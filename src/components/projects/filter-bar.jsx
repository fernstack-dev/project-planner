"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Grid, Menu, ArrowUpDown, Folder, Plus } from "lucide-react";
import { useState } from "react";

export function FilterBar({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCategory,
  setSelectedCategory,
  categories,
  viewMode,
  setViewMode,
  onNewProject,
}) {
  const [openSort, setOpenSort] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const sortOptions = [
    { value: "updatedAt", label: "Последнее изменение" },
    { value: "createdAt", label: "Дата создания" },
    { value: "name", label: "Имя" },
  ];

  const orderOptions = [
    { value: "desc", label: "Новые первыми" },
    { value: "asc", label: "Старые первыми" },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || "Сортировка";
  const currentCategoryLabel = selectedCategory === "all" ? "Все категории" : selectedCategory;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewProject}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Новый проект</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">
              <p>Новый проект</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu open={openSort} onOpenChange={setOpenSort}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs h-9 bg-gray-900 border-gray-800 hover:bg-gray-850 cursor-pointer"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentSortLabel}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                <p>Сортировка</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-56 bg-gray-900 border-gray-800">
              <DropdownMenuLabel>Сортировать по:</DropdownMenuLabel>
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-gray-800 cursor-pointer" : "cursor-pointer"}
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
                  className={sortOrder === option.value ? "bg-gray-800 cursor-pointer" : "cursor-pointer"}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={openCategory} onOpenChange={setOpenCategory}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs h-9 bg-gray-900 border-gray-800 hover:bg-gray-850 cursor-pointer"
                  >
                    <Folder className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentCategoryLabel}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                <p>Категория</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800">
              <DropdownMenuItem
                onClick={() => setSelectedCategory("all")}
                className={selectedCategory === "all" ? "bg-gray-800 cursor-pointer" : "cursor-pointer"}
              >
                Все категории
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-gray-800 cursor-pointer" : "cursor-pointer"}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center h-9 gap-3">
          <div className="flex items-center gap-0 border border-gray-800 overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`px-3 py-1.5 flex items-center justify-center h-full transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-850"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4 text-gray-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                <p>Сетка</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`px-3 py-1.5 flex items-center justify-center h-full transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-850"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <Menu className="h-4 w-4 text-gray-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                <p>Список</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}