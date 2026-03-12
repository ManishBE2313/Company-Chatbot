// src/hooks/useChat.ts
import { useState, useCallback } from "react";
import { Message, Sender } from "@/types/chat";
import { sendChatMessage } from "@/services/apiClient";

export function useChat() {
  // Generate a random thread ID once when the hook initializes
  const [threadId] = useState(() => "thread_" + Math.random().toString(36).substring(2, 11));
  
  // State to hold the conversation history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I am your company AI assistant. How can I help you today?",
      sender: Sender.AI,
      timestamp: new Date(),
    },
  ]);
  
  // State to track if the AI is currently processing a response
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Create and add the user's message to the UI instantly
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: Sender.USER,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 2. Send the request to your FastAPI backend
      const response = await sendChatMessage({
        question: text,
        thread_id: threadId,
      });

      // 3. Create and add the AI's response to the UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: Sender.AI,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      // Handle security blocks or server errors safely
      setError(err.message || "Failed to connect to the server.");
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