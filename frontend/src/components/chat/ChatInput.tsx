// src/components/chat/ChatInput.tsx
import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * The bottom input bar for the chat interface.
 * Handles typing state and keyboard shortcuts (Enter to send, Shift+Enter for new line).
 */
export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If the user presses Enter without holding Shift, send the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      handleSend();
    }
  };

  return (
    <div className="relative flex w-full items-end gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the company AI..."
        disabled={disabled}
        className="min-h-[44px] max-h-32 w-full border-none bg-transparent p-0 py-2 shadow-none focus-visible:ring-0 sm:text-sm"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        size="sm"
        className="h-[36px] w-[36px] shrink-0 rounded-full p-0"
      >
        <Send size={16} />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
};