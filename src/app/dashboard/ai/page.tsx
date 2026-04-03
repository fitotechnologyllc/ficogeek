"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef, Suspense } from "react";
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
import { AIBubble } from "@/components/ai/AIBubble";
import { AIProgressTracker } from "@/components/ai/AIProgressTracker";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { logAnalyticsEvent } from "@/lib/analytics";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, limit } from "firebase/firestore";
import { LetterPreview } from "@/components/LetterPreview";

export default function AIDashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-blue/10 border-t-primary-blue rounded-full animate-spin" />
      </div>
    }>
      <AIChatContent />
    </Suspense>
  );
}

function AIChatContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isIntakeMode = mode === "intake";

  useEffect(() => {
    if (isIntakeMode && user) {
      logAnalyticsEvent(user.uid, "ai_intake_start");
    }
  }, [isIntakeMode, user]);

  const [conversationId] = useState(`conv_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const intakeSteps = [
    { id: "bureau", label: "Bureau" },
    { id: "account", label: "Account" },
    { id: "reason", label: "Reason" },
    { id: "review", label: "Review" },
    { id: "letter", label: "Done" }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [generatedLetters, setGeneratedLetters] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Sync with Firestore Intake
  useEffect(() => {
    if (!user || !isIntakeMode) return;
    
    const intakeId = `intake_${conversationId}`;
    const unsub = onSnapshot(doc(db, "profiles", user.uid, "intakes", intakeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCompletionPercentage(data.completionPercent || 0);
        
        // Map percentage to 5 steps
        if (data.completionPercent >= 100) setCurrentStepIndex(4);
        else if (data.completionPercent > 75) setCurrentStepIndex(3);
        else if (data.completionPercent > 50) setCurrentStepIndex(2);
        else if (data.completionPercent > 25) setCurrentStepIndex(1);
        else setCurrentStepIndex(0);
      }
    });

    return () => unsub();
  }, [user, conversationId, isIntakeMode]);

  // Sync with Generated Letters
  useEffect(() => {
    if (!user || !isIntakeMode) return;

    const q = query(
      collection(db, "letters"), 
      where("conversationId", "==", conversationId),
      limit(3)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const letters = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setGeneratedLetters(letters);
        setShowPreview(true);
      }
    });

    return () => unsub();
  }, [user, conversationId, isIntakeMode]);

  const { messages, append, status, setMessages } = useChat({
    api: '/api/ai/chat',
    body: {
      conversationId,
      userId: user?.uid,
      isIntakeMode: isIntakeMode
    },
    initialMessages: isIntakeMode ? [
      {
        id: 'initial-geek',
        role: 'assistant',
        content: "I can help you create your first dispute letter in just a few steps. Which credit bureau are you working with — Experian, Equifax, TransUnion, or all three?"
      }
    ] : []
  } as any) as any;

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleReplyClick = async (reply: string) => {
    if (user) {
      logAnalyticsEvent(user.uid, "ai_intake_progress", { reply });
    }
    await append({ role: 'user', content: reply });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (user) {
      logAnalyticsEvent(user.uid, "ai_intake_progress", { length: input.length });
    }
    
    const userMessage = input;
    setInput("");
    
    try {
      await append({
        role: "user",
        content: userMessage
      });
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
    <div className="space-y-12 max-w-7xl mx-auto h-[calc(100vh-180px)] mb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Sparkles className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Audit Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Agent Geek</h1>
          <p className="text-slate-500 font-medium tracking-tight">Your intelligent gateway to credit laws, dispute logic, and terminal guidance.</p>
        </div>
        <Link href="/dashboard/ai" className="btn-primary flex items-center gap-3 py-4 px-8 shadow-2xl uppercase tracking-widest text-[10px] font-bold italic">
          <Plus className="w-5 h-5" />
          <span>New Audit Session</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
         {/* Sidebar: Recent Activity */}
         <div className="lg:col-span-1 space-y-8 flex flex-col">
            <div className="premium-card p-8 flex-1 border-slate-100 overflow-y-auto">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-3 italic">
                     <History className="w-4 h-4 text-primary-blue" /> Audit Timeline
                  </h3>
               </div>
               <div className="space-y-4">
                  <RecentThread title="Section 609 Verification" date="Today" active />
                  <RecentThread title="Experian Audit Prep" date="Yesterday" />
                  <RecentThread title="Terminal Protocol" date="Mar 28" />
               </div>
            </div>

            <div className="premium-card p-8 space-y-6 bg-slate-50 border-dashed border-2 border-slate-200">
               <h4 className="text-[10px] font-bold text-primary-navy uppercase tracking-widest italic">Official Resources</h4>
               <div className="space-y-3">
                  <ResourceLink label="AnnualCreditReport.com" href="https://www.annualcreditreport.com" />
                  <ResourceLink label="CFPB Complaint Portal" href="https://www.consumerfinance.gov/complaint/" />
                  <ResourceLink label="FTC Identity Theft Center" href="https://www.identitytheft.gov" />
               </div>
            </div>

            <div className="premium-card p-10 bg-primary-navy text-white relative overflow-hidden shadow-2xl group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                     <h4 className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest italic leading-none">PII Security Advisory</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider italic">Never share full SSNs or account numbers in chat. Agent Geek is an educational engine, not a live support agent.</p>
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
                     <h3 className="font-bold text-primary-navy italic">GEEK Intelligence</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversational AI Engine v1.1.0</p>
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
               {isIntakeMode && (
                  <AIProgressTracker 
                    steps={intakeSteps} 
                    currentStepIndex={currentStepIndex} 
                    completionPercentage={completionPercentage} 
                  />
               )}

               {showPreview && generatedLetters.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary-blue/5 p-8 rounded-[2.5rem] border border-primary-blue/10">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase italic tracking-tight">Dispute Protocol Generated</h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Review your legal instrument below before finalizing in the forge.</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setShowPreview(false)}
                             className="px-6 py-3 text-[10px] font-bold text-slate-400 hover:text-primary-navy uppercase tracking-widest transition-all italic border border-slate-100 rounded-xl bg-white"
                           >
                             Continue Chat
                           </button>
                           <Link 
                             href="/dashboard/letters"
                             className="btn-primary px-8 py-4 text-[10px] font-bold uppercase tracking-widest italic shadow-xl flex items-center gap-3"
                           >
                              Finalize in Forge <ArrowRight className="w-4 h-4" />
                           </Link>
                        </div>
                     </div>
                     {generatedLetters.map((letter: any) => (
                        <LetterPreview 
                          key={letter.id}
                          content={letter.content}
                          recipient={letter.bureau}
                          address="Bureau Address Placeholder"
                          userName={profile?.name}
                          userAddress={profile?.address}
                        />
                     ))}
                  </motion.div>
               ) : (
                 <>
                  {messages.length === 0 && !isIntakeMode ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-10">
                       <div className="w-24 h-24 bg-white border border-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100 rotate-6 shadow-2xl">
                          <MessageSquare className="w-12 h-12" />
                       </div>
                        <div className="space-y-4">
                           <h2 className="text-3xl font-extrabold font-outfit text-primary-navy uppercase italic tracking-tight">Agent Geek Online</h2>
                           <p className="text-slate-400 font-bold italic text-[11px] leading-relaxed uppercase tracking-wider px-12">
                             I am your personal credit dispute strategist. I can help you identify report errors, frame legal arguments under the FCRA, and draft powerful dispute letters.
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                           <QuickBlock label="Start Dispute Intake" onClick={() => handleReplyClick("I want to start a new dispute intake mission.")} primary />
                           <QuickBlock label="Analyze Report Item" onClick={() => handleReplyClick("I need help analyzing a specific error on my credit report.")} />
                           <QuickBlock label="Frame Legal Argument" onClick={() => handleReplyClick("Help me frame a legal argument using FCRA or FDCPA logic.")} />
                           <QuickBlock label="Audit Mailing Strategy" onClick={() => handleReplyClick("What is the institutional gold standard for mailing disputes?")} />
                        </div>
                       <div className="pt-4">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 italic">
                             <ShieldCheck className="w-4 h-4" /> Hardened SSL Session Engaged
                          </p>
                       </div>
                    </div>
                  ) : (
                    messages.map((m: any) => (
                       <AIBubble 
                         key={m.id} 
                         role={m.role as any} 
                         content={m.parts ? m.parts.map((p: any, idx: number) => p.type === 'text' ? p.text : null).join('') : (m as any).content} 
                         quickReplies={(m.id === 'initial-geek') ? ["Experian", "Equifax", "TransUnion", "All Three"] : undefined}
                         onReplyClick={handleReplyClick}
                       />
                    ))
                  )}
                 </>
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
                  <ShieldCheck className="w-4 h-4" /> Geek Core Intelligence Layer
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

function QuickBlock({ label, onClick, primary = false }: { label: string, onClick?: () => void, primary?: boolean }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between group italic border-2 ${
         primary ? "bg-primary-blue/5 border-primary-blue text-primary-blue shadow-lg active:scale-95" : "bg-white border-slate-100 text-slate-400 hover:border-primary-blue hover:text-primary-blue hover:shadow-2xl active:scale-95"
      }`}
    >
       <span>{label}</span>
       <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}

function ResourceLink({ label, href }: { label: string, href: string }) {
  return (
     <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between group p-2 hover:bg-white rounded-lg transition-all">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic group-hover:text-primary-blue">{label}</span>
        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary-blue" />
     </a>
  );
}
