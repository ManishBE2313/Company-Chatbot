"use client";

import * as React from "react";
import { Message, Sender } from "@/types/chat";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/classNames";
import { ThumbsUp, ThumbsDown, Copy, Check, FileText } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

/**
 * Renders a single chat bubble.
 * Upgraded to include an Action Bar (Copy, Like, Dislike) 
 * and automatically extract/format the Source document.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === Sender.AI;
  const [copied, setCopied] = React.useState(false);

  // 1. SMART PARSER: Detect and extract the "Source: [filename]" from the backend string.
  // This looks for "Source:" or "Sources:" at the very end of the AI's response.
  const sourceRegex = /(?:\n\s*)?(?:Source|Sources):\s*([\s\S]+)$/i;
  const match = message.content.match(sourceRegex);
  
  const sourceText = match ? match[1].trim() : null;
  const displayContent = message.content.replace(sourceRegex, '').trim();

  // 2. COPY FUNCTIONALITY
  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Revert checkmark back to copy icon after 2s
  };

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
        {/* Name Tag */}
        <span className="text-[13px] font-medium text-slate-400 px-1 select-none">
          {isAI ? "Enterprise AI" : "You"}
        </span>
        
        {/* The Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ring-1 ring-inset",
            isAI 
              ? "bg-white text-slate-800 ring-slate-200/60 rounded-tl-sm" 
              : "bg-indigo-600 text-white ring-indigo-700 rounded-tr-sm"
          )}
        >
          {/* We use displayContent here so the 'Source: ...' text is removed from the bubble */}
          <p className="whitespace-pre-wrap tracking-[0.01em]">
            {displayContent || (isAI ? "" : message.content)}
          </p>
        </div>

        {/* The Premium Action Bar (Only shows for the AI) */}
        {isAI && displayContent && (
          <div className="flex items-center gap-1.5 mt-1 px-1 text-slate-400 w-full">
            
            <button
              onClick={handleCopy}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            
            <button
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Good response"
            >
              <ThumbsUp size={14} />
            </button>
            
            <button
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Bad response"
            >
              <ThumbsDown size={14} />
            </button>

            {/* Separated Source Badge */}
            {sourceText && (
              <div 
                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 ring-1 ring-inset ring-slate-200 text-[11px] font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer" 
                title={`Source Document: ${sourceText}`}
              >
                <FileText size={12} />
                <span className="max-w-[150px] truncate">{sourceText}</span>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};