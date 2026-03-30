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
// src/app/page.tsx
// Updated: added HR Portal navigation button for admin/superadmin users.
// All existing policy viewer + floating chat widget behaviour is unchanged.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import FloatingChatWidget from "@/components/chat/FloatingChatWidget";
import { policiesData } from "@/data/policies";
import { Power, ShieldCheck } from "lucide-react";
import { logoutUser, getCurrentUser } from "@/services/apiClient";

export default function Home() {
  const router = useRouter();

  const [activePolicyId, setActivePolicyId] = React.useState(policiesData[0].id);
  const [isAZExpanded, setIsAZExpanded] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Fetch role so we can conditionally show the HR Portal link.
  // Reuses the existing getCurrentUser call from apiClient.ts — no new endpoint needed.
 const [user, setUser] = React.useState<{
  email: string | null;
  role: string;
} | null>(null);
React.useEffect(() => {
  getCurrentUser()
    .then((u) =>
      setUser({
        email: u.email,
        role: u.role ?? "employee",
      })
    )
    .catch(() =>
      setUser({
        email: "",
        role: "employee",
      })
    );
}, []);
   const userEmail = user?.email;
  const userRole = user?.role;
  const canAccessHRPortal = userRole === "interviewer" || userRole === "admin" || userRole === "superadmin";
  const canAccessEmployeePortal = userRole === "user" || userRole === "admin" || userRole === "superadmin"; // role to be changed to employee
  const activePolicy =
    policiesData.find((p) => p.id === activePolicyId) || policiesData[0];

  const handleSidebarLogout = async () => {
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
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800">

      {/* ── Left Sidebar ── */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full shadow-sm z-10">

        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-100 shrink-0">
          <h1 className="font-bold text-blue-800 tracking-tight flex flex-col items-center leading-none mt-2">
            <span className="text-[28px]">BE</span>
            <span className="text-[18px] tracking-widest text-blue-600 mt-1">BLOCK EXCEL</span>
          </h1>
        </div>

        {/* Policy nav — unchanged from original */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="mb-4 px-3">
            <div
              onClick={() => setIsAZExpanded(!isAZExpanded)}
              className="flex items-center justify-between bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-indigo-100 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 border border-indigo-300 rounded text-xs bg-white text-indigo-500 font-bold">
                  {isAZExpanded ? "−" : "+"}
                </span>
                A-Z
              </div>
              <span className={`text-[10px] transition-transform duration-200 ${isAZExpanded ? "" : "-rotate-90"}`}>
                ▼
              </span>
            </div>
          </div>

          <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${isAZExpanded ? "max-h-auto opacity-100" : "max-h-0 opacity-0"}`}>
            {policiesData.map((policy) => {
              const isActive = policy.id === activePolicyId;
              return (
                <li key={policy.id}>
                  <button
                    onClick={() => setActivePolicyId(policy.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] rounded-md transition-colors text-left ${
                      isActive
                        ? "text-slate-800 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-4 ${
                      isActive ? "bg-indigo-500 ring-indigo-100" : "bg-slate-300 ring-transparent"
                    }`} />
                    {policy.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Bottom user section ── */}
        <div className="shrink-0 border-t border-slate-200 p-5 bg-white">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 mb-4 px-2 uppercase">
            User
          </div>
          {canAccessEmployeePortal && (
            <button
              onClick={() => router.push(`employee/${userEmail}`)}
              className="flex items-center gap-3 px-2 py-2 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors text-[14px] font-medium mb-1"
            >
              <ShieldCheck size={16} className="text-indigo-500" />
              <span>Employee Portal</span>
            </button>
          )}

          {/* HR Portal button — shown to interviewer / admin / superadmin */}
          {canAccessHRPortal && (
            <button
              onClick={() => router.push("/hr")}
              className="flex items-center gap-3 px-2 py-2 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors text-[14px] font-medium mb-1"
            >
              <ShieldCheck size={16} className="text-indigo-500" />
              <span>HR Portal</span>
            </button>
          )}

          {/* Logout — unchanged */}
          <button
            onClick={handleSidebarLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-2 py-2 w-full text-slate-500 hover:text-slate-800 transition-colors text-[15px] font-medium disabled:opacity-50"
          >
            <Power size={18} strokeWidth={2} className="text-slate-400" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content — completely unchanged ── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[85vh]">
          <div className="border-b border-slate-200 bg-white px-8 py-6 text-center">
            <h2 className="text-[16px] font-semibold text-slate-600 uppercase tracking-wide">
              {activePolicy.title} POLICY AND COMPLAINT PROCEDURE
            </h2>
          </div>
          <div className="p-8 lg:p-10 text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
            {activePolicy.content}
          </div>
        </div>
      </main>

      {/* Floating chat widget — unchanged */}
      <FloatingChatWidget />
    </div>
  );
}
