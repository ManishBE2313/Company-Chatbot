import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Enterprise AI Assistant",
  description: "Secure, memory-aware enterprise AI chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-indigo-200 selection:text-indigo-900`} 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}