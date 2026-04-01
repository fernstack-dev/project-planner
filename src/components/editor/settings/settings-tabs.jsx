"use client";

import { cn } from "@/lib/utils";

export function SettingsTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-800">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "text-emerald-300 border-b-2 border-emerald-500 -mb-px"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}