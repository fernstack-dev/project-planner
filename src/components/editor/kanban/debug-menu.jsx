"use client"

import { useState, useEffect } from "react"
import { Bug, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DebugMenu({ logs = [], state = {} }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState("all")

  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-gray-200">DnD Debug</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {/* State dump */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-400">Current State</div>
              <pre className="text-[10px] bg-gray-950 p-2 rounded border border-gray-800 text-gray-300 overflow-x-auto">
                {JSON.stringify(state, null, 2)}
              </pre>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1">
              {["all", "drag", "drop", "reorder"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-[10px] px-2 py-1 rounded capitalize ${
                    filter === type
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Logs */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-400">Event Log</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {logs
                  .filter((log) => filter === "all" || log.type === filter)
                  .slice(-20)
                  .map((log, i) => (
                    <div
                      key={i}
                      className={`text-[10px] p-1.5 rounded border ${
                        log.type === "drag"
                          ? "border-blue-800/30 bg-blue-950/20"
                          : log.type === "drop"
                          ? "border-purple-800/30 bg-purple-950/20"
                          : log.type === "reorder"
                          ? "border-emerald-800/30 bg-emerald-950/20"
                          : "border-gray-800 bg-gray-900"
                      }`}
                    >
                      <span className="text-gray-400 mr-1">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}