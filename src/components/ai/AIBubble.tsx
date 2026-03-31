"use client";

import ReactMarkdown from 'react-markdown';
import { Bot, User, Sparkles } from "lucide-react";

interface AIBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function AIBubble({ role, content }: AIBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex gap-4 p-6 rounded-3xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
      isAssistant 
        ? "bg-slate-50/50 border border-slate-100/50" 
        : "bg-primary-navy/5 border border-primary-navy/10 ml-12"
    }`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
        isAssistant 
          ? "bg-primary-navy text-white" 
          : "bg-white border border-slate-100 text-slate-400"
      }`}>
        {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
             {isAssistant ? "FICO Geek AI" : "You"}
           </span>
           {isAssistant && <Sparkles className="w-3 h-3 text-secondary-teal animate-pulse" />}
        </div>
        
        <div className={`prose prose-sm max-w-none prose-slate font-medium leading-relaxed ${
          isAssistant ? "text-slate-700" : "text-primary-navy"
        }`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
