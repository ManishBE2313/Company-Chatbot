// src/types/chat.ts

/**
 * Defines the possible senders in the chat application.
 */
export enum Sender {
  USER = "USER",
  AI = "AI",
}

/**
 * Represents a single message bubble in the chat UI.
 */
export interface Message {
  id: string;
  content: string;
  sender: Sender;
  timestamp: Date;
}

/**
 * The exact JSON payload expected by our FastAPI backend.
 */
export interface ChatApiRequest {
  question: string;
  thread_id?: string;
}

/**
 * The exact JSON payload returned by our FastAPI backend.
 */
export interface ChatApiResponse {
  question: string;
  answer: string;
  route_taken: string;
}