import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 px-6 text-center">
      
      {/* Premium Icon Container */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-inset ring-slate-200/60">
        <FileQuestion size={40} strokeWidth={1.5} />
      </div>
      
      {/* Error Messaging */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-[15px] text-slate-500 leading-relaxed">
        We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
      </p>
      
      {/* Return Button */}
      <Link href="/">
        <Button className="h-11 rounded-xl bg-indigo-600 px-6 text-[15px] font-medium text-white shadow-sm hover:bg-indigo-700 transition-transform active:scale-95">
          Return to Chat
        </Button>
      </Link>

    </div>
  );
}