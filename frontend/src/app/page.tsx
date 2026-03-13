// // src/app/page.tsx
// "use client"; // Required because we are using React Hooks (useState, useEffect)

// import * as React from "react";
// import { useChat } from "@/hooks/useChat";
// import { ChatMessage } from "@/components/chat/ChatMessage";
// import { ChatInput } from "@/components/chat/ChatInput";
// import { Bot } from "lucide-react";

// export default function Home() {
//   const { messages, isLoading, error, sendMessage } = useChat();
//   const messagesEndRef = React.useRef<HTMLDivElement>(null);

//   // Auto-scroll to the bottom whenever the messages array changes
//   React.useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex h-screen w-full flex-col bg-gray-50">
      
//       {/* Header */}
//       <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
//         <div className="flex items-center gap-2 font-semibold text-gray-800">
//           <Bot className="text-blue-600" size={24} />
//           <span>Enterprise AI Assistant</span>
//         </div>
//       </header>

//       {/* Scrollable Chat Area */}
//       <main className="flex-1 overflow-y-auto p-4 sm:p-6">
//         <div className="mx-auto flex max-w-3xl flex-col gap-2">
          
//           {messages.map((msg) => (
//             <ChatMessage key={msg.id} message={msg} />
//           ))}

//           {/* Loading Indicator */}
//           {isLoading && (
//             <div className="flex w-full items-start gap-4 py-4 justify-start">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-blue-100 border-blue-200 text-blue-700">
//                 <Bot size={18} />
//               </div>
//               <div className="flex items-center rounded-2xl bg-white border border-gray-100 px-5 py-3 shadow-sm h-[44px]">
//                 <span className="flex gap-1">
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
//                   <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="my-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
//               {error}
//             </div>
//           )}

//           {/* Invisible div to scroll to */}
//           <div ref={messagesEndRef} />
//         </div>
//       </main>

//       {/* Fixed Bottom Input Area */}
//       <footer className="shrink-0 bg-transparent p-4 sm:p-6">
//         <div className="mx-auto max-w-3xl">
//           <ChatInput onSend={sendMessage} disabled={isLoading} />
//           <div className="mt-2 text-center text-xs text-gray-400">
//             AI can make mistakes. Verify important company policies.
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }





// src/app/page.tsx
"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCurrentUser, logoutUser } from "@/services/apiClient";

export default function Home() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // NEW: State to track if the widget is open or closed
  const [isOpen, setIsOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Auto-scroll to the bottom whenever the messages array changes
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  React.useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setUserEmail(user.email || "");
        }
      } catch {
        if (isMounted) {
          setUserEmail("");
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    // NEW: The main container is now fixed to the bottom-right corner
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
      
      {/* The Chat Window (Only renders if isOpen is true) */}
      {isOpen && (
        <div className="flex h-[550px] max-h-[80vh] w-[350px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl transition-all sm:w-[400px]">
          
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <Bot className="text-indigo-600" size={24} />
              <div className="flex flex-col leading-tight">
                <span>Enterprise AI</span>
                <span className="text-[11px] font-normal text-gray-500">
                  {isProfileLoading ? "Loading profile..." : `Welcome, ${userEmail || "User"}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={handleLogout}
                isLoading={isLoggingOut}
              >
                Logout
              </Button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Scrollable Chat Area */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex w-full items-start gap-3 py-2 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-inset ring-indigo-600/20">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm h-[40px]">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="my-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Fixed Bottom Input Area */}
          <footer className="shrink-0 bg-white p-3 border-t border-gray-100">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
            <div className="mt-2 text-center text-[10px] text-gray-400">
              AI can make mistakes. Verify important policies.
            </div>
          </footer>
        </div>
      )}

      {/* NEW: The Floating Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "hover:bg-indigo-700"
        }`}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

    </div>
  );
}
