"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthCard({ activeTab, onTabChange }) {
  const handleTabChange = (value) => {
    onTabChange(value);
    if (value === "register") {
      window.history.replaceState(null, "", "/login?tab=register");
    } else {
      window.history.replaceState(null, "", "/login");
    }
  };

  return (
    <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 gap-0 border-b border-gray-800">
            <TabsTrigger
              value="login"
              className="relative rounded-none pb-3 pt-2 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 text-gray-400 hover:text-gray-300 transition-all duration-200"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Вход
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="relative rounded-none pb-3 pt-2 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 text-gray-400 hover:text-gray-300 transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-6">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register" className="space-y-4 pt-6">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
