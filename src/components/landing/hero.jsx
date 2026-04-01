"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { KanbanMockup } from "./kanban-mockup";

export function Hero() {
  return (
    <div className="grid md:grid-cols-2 min-h-[600px]">
      <div className="flex flex-col justify-center items-center p-8 md:p-12 bg-gray-950 border-r border-gray-800">
        <div className="max-w-md text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-white bg-clip-text text-transparent">
              Projify
            </span>
          </h1>
          <p className="text-xl text-gray-400 mt-4 mb-8">
            Планируйте личные проекты без стресса. Канбан-доски, задачи, заметки и сроки в одном месте.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 transition-all hover:scale-105">
              <Link href="/projects">
                Начать бесплатно
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 transition-all hover:scale-105">
              <Link href="#features">
                Узнать больше
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative h-full min-h-[400px] md:min-h-full bg-gray-950 overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
        <KanbanMockup />
      </div>
    </div>
  );
}