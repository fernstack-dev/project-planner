"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ProjectSettings({ project, onUpdate, autoSave = true }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/projects');
      } else {
        alert('Не удалось удалить проект');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 pt-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Управление проектом</h3>
        <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/30 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  <h4 className="text-base font-semibold text-red-400">
                    Удалить проект
                  </h4>
                </div>
                <p className="text-sm text-gray-400">
                  Это действие нельзя отменить. Все данные проекта (задачи, доски, участники) будут безвозвратно удалены.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-none whitespace-nowrap cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Удаление...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить проект
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border border-gray-800 text-white rounded-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Вы уверены?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Проект &quot;{project.name}&quot; будет полностью удалён вместе со всеми задачами, досками и настройками. Это действие невозможно отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 rounded-none cursor-pointer">
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-none cursor-pointer"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}