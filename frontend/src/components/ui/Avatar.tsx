import * as React from "react";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/utils/classNames";
import { Sender } from "@/types/chat";

interface AvatarProps {
  sender: Sender;
  className?: string;
}

/**
 * Displays a visual icon representing the message sender.
 * Upgraded to a premium SaaS look using gradients and soft shadows.
 */
export const Avatar: React.FC<AvatarProps> = ({ sender, className }) => {
  const isAI = sender === Sender.AI;

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset transition-all",
        isAI 
          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-indigo-600/20" 
          : "bg-white text-slate-600 ring-slate-200",
        className
      )}
    >
      {/* Sparkles give a modern "AI" feel compared to a standard bot icon */}
      {isAI ? <Sparkles size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
    </div>
  );
};