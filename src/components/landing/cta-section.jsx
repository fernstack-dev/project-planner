"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <div className="text-center py-16 border-t border-gray-800">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
        Готовы начать?
      </h2>
      <p className="text-gray-400 max-w-xl mx-auto mb-8">
        Присоединяйтесь к тысячам команд, которые уже используют ProjectPlanner.
      </p>
      <Button asChild size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8">
        <Link href="/projects">
          Создать проект
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}