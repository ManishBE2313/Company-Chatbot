// src/services/apiClient.ts
import { ChatApiRequest, ChatApiResponse } from "@/types/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Sends a user query to the LangGraph backend and retrieves the AI's response.
 * Includes error handling to ensure the UI does not crash on failed requests.
 */
export async function sendChatMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // Extract backend error messages if available (e.g., our 400 Prompt Injection alert)
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data: ChatApiResponse = await response.json();
    return data;
    
  } catch (error) {
    console.error("API Client Error:", error);
    throw error; 
  }
}