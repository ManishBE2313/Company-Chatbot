// src/app/page.tsx
"use client"; // Required because we are using React Hooks (useState, useEffect)

import * as React from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "lucide-react";

export default function Home() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever the messages array changes
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Bot className="text-blue-600" size={24} />
          <span>Enterprise AI Assistant</span>
        </div>
      </header>

      {/* Scrollable Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex w-full items-start gap-4 py-4 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-blue-100 border-blue-200 text-blue-700">
                <Bot size={18} />
              </div>
              <div className="flex items-center rounded-2xl bg-white border border-gray-100 px-5 py-3 shadow-sm h-[44px]">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="my-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Fixed Bottom Input Area */}
      <footer className="shrink-0 bg-transparent p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
          <div className="mt-2 text-center text-xs text-gray-400">
            AI can make mistakes. Verify important company policies.
          </div>
        </div>
      </footer>

    </div>
  );
}