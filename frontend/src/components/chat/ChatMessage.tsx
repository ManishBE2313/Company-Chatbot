// src/components/chat/ChatMessage.tsx
import * as React from "react";
import { Message, Sender } from "@/types/chat";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/classNames";

interface ChatMessageProps {
  message: Message;
}

/**
 * Renders a single chat bubble.
 * Automatically aligns and styles the bubble based on who sent the message.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === Sender.AI;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4",
        isAI ? "justify-start" : "justify-end flex-row-reverse"
      )}
    >
      <Avatar sender={message.sender} />
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
          isAI 
            ? "bg-white border border-gray-100 text-gray-800" 
            : "bg-blue-600 text-white"
        )}
      >
        {/* We use whitespace-pre-wrap to respect line breaks from the AI's response */}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};