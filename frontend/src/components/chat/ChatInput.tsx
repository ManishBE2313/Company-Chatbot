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
 * Upgraded with an auto-resizing text area that expands up to 200px 
 * and then becomes cleanly scrollable.
 */
export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize magic: This adjusts the physical height of the textarea
  // to match its internal scroll height whenever the text changes.
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // First, reset height to auto so it shrinks when text is deleted
      textarea.style.height = "auto";
      // Then set the height to perfectly match the text inside it
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      // The useEffect above will automatically shrink the box back down 
      // when 'input' becomes empty!
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleSend();
    }
  };

  return (
    <div className="relative flex w-full items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-indigo-300/50">
      <TextArea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the enterprise AI..."
        disabled={disabled}
        // Added overflow-y-auto so the custom scrollbar appears if it hits max-h-[200px]
        className="min-h-[44px] max-h-[200px] w-full border-0 bg-transparent px-2 py-2.5 shadow-none focus-visible:ring-0 sm:text-[15px] leading-relaxed overflow-y-auto"
        rows={1}
      />
      
      {/* Premium Send Button */}
      <Button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="mb-1 h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-transform active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 p-0"
      >
        <Send size={18} className={input.trim() && !disabled ? "text-white" : "text-slate-400"} />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
};