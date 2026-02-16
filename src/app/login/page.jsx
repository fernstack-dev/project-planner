"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  // Mock users for development
  const mockUsers = [
    { id: 'user1', email: 'demo@example.com', password: 'demo123', name: 'Демо пользователь' },
    { id: 'user2', email: 'alexey@example.com', password: 'password123', name: 'Алексей Петров' }
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = mockUsers.find(
      u => u.email === loginForm.email && u.password === loginForm.password
    )
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      router.push('/projects')
    } else {
      alert('Неверный email или пароль. Попробуйте: demo@example.com / demo123')
    }
    
    setIsLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name || 'Новый пользователь'
    }
    
    localStorage.setItem('user', JSON.stringify(newUser))
    router.push('/projects')
    
    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    setLoginForm({
      email: 'demo@example.com',
      password: 'demo123'
    })
    
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(
        new Event('submit', { cancelable: true })
      )
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/10">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-gray-300">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>

        <Card className="bg-gray-900/80 border-gray-800 shadow-2xl">
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600">
                  <LogIn className="h-4 w-4 mr-2" />
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Регистрация
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 pt-4">
                <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ваш@email.com"
                        className="pl-10 bg-gray-800/50 border-gray-700"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-gray-300">Пароль</Label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        {showPassword ? 'Скрыть' : 'Показать'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-gray-800/50 border-gray-700"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Входим...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Войти
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-emerald-400 hover:text-emerald-300 text-sm"
                      onClick={handleDemoLogin}
                    >
                      Использовать демо-аккаунт
                    </Button>
                  </div>
                </form>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 text-center">
                    Демо доступ: demo@example.com / demo123
                  </p>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 pt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-300">Имя</Label>
                    <Input
                      id="register-name"
                      placeholder="Ваше имя"
                      className="bg-gray-800/50 border-gray-700"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ваш@email.com"
                        className="pl-10 bg-gray-800/50 border-gray-700"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-800/50 border-gray-700"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="text-gray-300">Подтвердите пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-800/50 border-gray-700"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Регистрируем...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Зарегистрироваться
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 text-center">
                    Все данные сохраняются локально в вашем браузере
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ProjectPlanner © 2024 • Всё для управления проектами
          </p>
        </div>
      </div>
    </div>
  )
}