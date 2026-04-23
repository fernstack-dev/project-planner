"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/login/auth-card";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>

        <AuthCard activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
