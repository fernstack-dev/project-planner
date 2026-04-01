"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateProjectModal({ open, onOpenChange }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    color: "#10b981",
    status: "active",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error(error);
      alert("Не удалось создать проект");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    active: { label: "Активный" },
    completed: { label: "Завершен" },
    paused: { label: "На паузе" },
    archived: { label: "Архив" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white p-6 rounded-none max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold">Создать новый проект</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300 text-sm">
              Название
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-gray-800 border-gray-700 rounded-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Введите название проекта"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300 text-sm">
              Описание
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-700 rounded-none min-h-[80px]"
              placeholder="Опишите проект"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300 text-sm">
              Категория
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-gray-800 border-gray-700 rounded-none"
              placeholder="Введите категорию"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300 text-sm">
              Статус
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 rounded-none">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 rounded-none">
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value} className="text-gray-300 focus:bg-gray-700">
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full rounded-none"
          >
            {loading ? "Создаём..." : "Создать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}