"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  History, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AIBubble } from "@/components/ai/AIBubble";
import { motion } from "framer-motion";

export default function AIDashboardPage() {
  const { user } = useAuth();
  const [conversationId] = useState(`conv_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    api: '/api/ai/chat',
    body: {
      conversationId,
      userId: user?.uid,
      isIntakeMode: false
    }
  } as any);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput("");
    
    try {
      await sendMessage({
        parts: [{ type: 'text', text: userMessage }]
      } as any);
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-180px)] mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Sparkles className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Geek AI Powered</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">FICO Geek AI</h1>
          <p className="text-slate-500 font-medium tracking-tight">Your dedicated intelligent assistant for platform education and document drafting.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl">
          <Plus className="w-5 h-5" />
          <span>New AI Conversation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
         {/* Sidebar: Recent Activity */}
         <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="premium-card p-8 flex-1 border-slate-100 overflow-y-auto">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2 italic">
                     <History className="w-4 h-4 text-primary-blue" /> Conversation Logs
                  </h3>
               </div>
               <div className="space-y-4">
                  <RecentThread title="Section 609 Rights" date="Today" active />
                  <RecentThread title="Experian Dispute Preparation" date="Yesterday" />
                  <RecentThread title="Platform Navigation Help" date="Mar 28" />
               </div>
            </div>

            <div className="premium-card p-8 bg-primary-navy text-white relative overflow-hidden shadow-2xl group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
               <div className="space-y-4 relative z-10">
                  <h4 className="font-bold flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                     Education First
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium italic border-l border-white/20 pl-4">&quot;Our AI provides educational self-help guidance. For official credit reports, visit AnnualCreditReport.com.&quot;</p>
                  <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                     Visit Source <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
            </div>
         </div>

         {/* Main Chat Interface */}
         <div className="lg:col-span-3 premium-card flex flex-col bg-white border-none shadow-2xl overflow-hidden relative">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-navy text-white flex items-center justify-center shadow-lg shadow-navy-900/10">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-primary-navy italic">Primary Logic Interface</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversational AI Orchestration</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     Logic Core Online
                  </span>
               </div>
            </div>

            <div 
               ref={scrollRef}
               className="flex-1 overflow-y-auto p-10 space-y-8 bg-white/50 scroll-smooth"
            >
               {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
                     <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-200 rotate-3 shadow-inner">
                        <MessageSquare className="w-12 h-12" />
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-3xl font-bold font-outfit text-primary-navy">Intelligence Activated</h2>
                        <p className="text-slate-400 font-medium italic border-l-2 border-slate-100 pl-6 mx-12 text-sm leading-relaxed">&quot;I am ready to help you navigate Section 609, identify account inaccuracies, and draft professional correspondence. What would you like to build today?&quot;</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4 w-full">
                        <QuickBlock label="Learn Section 609" />
                        <QuickBlock label="Start Dispute Guide" />
                        <QuickBlock label="App Tutorial" />
                        <QuickBlock label="Credit Report Info" />
                     </div>
                  </div>
               ) : (
                  messages.map((m) => (
                     <AIBubble key={m.id} role={m.role as any} content={m.parts ? m.parts.map((p: any, idx: number) => p.type === 'text' ? p.text : null).join('') : (m as any).content} />
                  ))
               )}
            </div>

            {/* Expansive Input */}
            <div className="p-10 border-t border-slate-50 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
               <form 
                  onSubmit={handleFormSubmit}
                  className="relative group max-w-5xl mx-auto"
               >
                  <input 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder="Deploy a question to the Logic Interface..."
                     className="w-full pl-8 pr-20 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:bg-white focus:ring-8 focus:ring-primary-blue/5 transition-all font-bold text-lg text-slate-700 shadow-inner group-hover:border-slate-200"
                  />
                  <button 
                     type="submit"
                     disabled={isLoading || !input.trim()}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-5 bg-primary-navy text-white rounded-[2rem] shadow-xl shadow-navy-900/20 hover:bg-primary-navy-muted transition-all active:scale-95 disabled:bg-slate-200"
                  >
                     <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </form>
               <p className="mt-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Sovereign Logic Intelligence Layer &#183; v1.0.4 Prototype
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function RecentThread({ title, date, active = false }: any) {
  return (
    <div className={`p-4 rounded-2xl cursor-pointer transition-all border ${
      active ? "bg-primary-blue/5 border-primary-blue/20" : "bg-white border-transparent hover:bg-slate-50"
    }`}>
       <div className="space-y-1">
          <p className={`text-sm font-bold ${active ? "text-primary-navy" : "text-slate-600"}`}>{title}</p>
          <div className="flex items-center justify-between">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{date}</span>
             {active && <ArrowRight className="w-3 h-3 text-primary-blue" />}
          </div>
       </div>
    </div>
  );
}

function QuickBlock({ label }: any) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-3xl text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:border-primary-blue hover:text-primary-blue hover:shadow-xl transition-all flex items-center justify-between group">
       <span>{label}</span>
       <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}
