import * as React from "react";
import { Message, Sender } from "@/types/chat";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/classNames";

interface ChatMessageProps {
  message: Message;
}

/**
 * Renders a single chat bubble.
 * Upgraded with professional SaaS typography, structural alignment, and subtle borders.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === Sender.AI;

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-4 px-2 py-5 transition-colors",
        !isAI && "flex-row-reverse"
      )}
    >
      <Avatar sender={message.sender} />
      
      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]",
          !isAI && "items-end"
        )}
      >
        {/* Subtle name tag above the bubble */}
        <span className="text-[13px] font-medium text-slate-400 px-1 select-none">
          {isAI ? "Enterprise AI" : "You"}
        </span>
        
        {/* The message bubble */}
        <div
          className={cn(
            "rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ring-1 ring-inset",
            isAI 
              ? "bg-white text-slate-800 ring-slate-200/60 rounded-tl-sm" 
              : "bg-indigo-600 text-white ring-indigo-700 rounded-tr-sm"
          )}
        >
          <p className="whitespace-pre-wrap tracking-[0.01em]">{message.content}</p>
        </div>
      </div>
    </div>
  );
};