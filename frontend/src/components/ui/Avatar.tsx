// src/components/ui/Avatar.tsx
import * as React from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/utils/classNames";
import { Sender } from "@/types/chat";

interface AvatarProps {
  sender: Sender;
  className?: string;
}

/**
 * Displays a visual icon representing the message sender.
 * Automatically switches colors and icons based on the Sender enum.
 */
export const Avatar: React.FC<AvatarProps> = ({ sender, className }) => {
  const isAI = sender === Sender.AI;

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
        isAI 
          ? "bg-blue-100 border-blue-200 text-blue-700" 
          : "bg-gray-100 border-gray-300 text-gray-700",
        className
      )}
    >
      {isAI ? <Bot size={18} /> : <User size={18} />}
    </div>
  );
};