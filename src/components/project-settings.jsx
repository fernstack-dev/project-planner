"use client"

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Trash2 } from "lucide-react"

export function ProjectSettings({ project, onUpdate }) {
  const [settings, setSettings] = useState(project.settings || {})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onUpdate({ settings: newSettings })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Настройки проекта</h2>
        <p className="text-gray-400 text-sm">
          Управление настройками и параметрами проекта
        </p>
      </div>

      {/* General Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Основные настройки</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Уведомления</Label>
              <p className="text-sm text-gray-400">Получать уведомления об изменениях</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Авто-сохранение</Label>
              <p className="text-sm text-gray-400">Автоматически сохранять изменения</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Публичный доступ</Label>
              <p className="text-sm text-gray-400">Разрешить просмотр проекта по ссылке</p>
            </div>
            <Switch
              checked={settings.public}
              onCheckedChange={(checked) => handleSettingChange('public', checked)}
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-800">
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-300 mb-2">Опасная зона</h3>
              <p className="text-sm text-gray-400 mb-4">
                Эти действия необратимы. Будьте осторожны.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Архивировать проект</p>
                    <p className="text-sm text-gray-400">Скрыть проект из основного списка</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    Архивировать
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-rose-400">Удалить проект</p>
                    <p className="text-sm text-gray-400">Навсегда удалить проект и все данные</p>
                  </div>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border-gray-700"
                      >
                        Отмена
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          alert('Проект удален (это демо)')
                          setShowDeleteConfirm(false)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Подтвердить удаление
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить проект
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}