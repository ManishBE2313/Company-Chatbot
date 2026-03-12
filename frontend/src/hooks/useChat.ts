import { useState, useCallback } from "react";
import { Message, Sender } from "@/types/chat";
import { streamChatMessage } from "@/services/apiClient";

export function useChat() {
  const [threadId] = useState(() => "thread_" + Math.random().toString(36).substring(2, 11));
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I am your company AI assistant. How can I help you today?",
      sender: Sender.AI,
      timestamp: new Date(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: Sender.USER,
      timestamp: new Date(),
    };

    // 2. Add an EMPTY AI Message (This creates the empty chat bubble on the screen instantly)
    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage: Message = {
      id: aiMessageId,
      content: "",
      sender: Sender.AI,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, initialAiMessage]);
    
    // Show the bouncing loading dots
    setIsLoading(true);
    setError(null);

    try {
      let isFirstChunk = true;

      // 3. Open the stream and listen for tokens
      await streamChatMessage(
        { question: text, thread_id: threadId },
        (chunk) => {
          // As soon as the first word arrives, hide the bouncing dots!
          if (isFirstChunk) {
            setIsLoading(false);
            isFirstChunk = false;
          }

          // Append the incoming word to the exact AI message bubble we created earlier
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
      
      // If the AI failed completely before sending text, remove the empty bubble
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.id === aiMessageId && lastMsg.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}