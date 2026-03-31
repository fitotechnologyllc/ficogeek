"use client";

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  ChevronDown,
  FileText,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AIBubble } from "./AIBubble";
import { LetterEditorModal } from "./LetterEditorModal";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isIntakeMode?: boolean;
}

export function ChatWindow({ isOpen, onClose, isIntakeMode = false }: ChatWindowProps) {
  const { user } = useAuth();
  const [conversationId] = useState(`conv_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeLetterIds, setActiveLetterIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    body: {
      conversationId,
      userId: user?.uid,
      isIntakeMode
    },
    onFinish: (message) => {
       // Check for tool results in the finished message if using older SDK
    }
  });

  // Extract tool results from messages to show the "Success" UI
  const getLatestToolResult = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.toolInvocations) {
        const result = m.toolInvocations.find(ti => 
          ti.toolName === 'generate_dispute_letters' && ti.state === 'result'
        );
        if (result && (result as any).result?.success) {
           return (result as any).result;
        }
      }
    }
    return null;
  };

  const toolResult = getLatestToolResult();

  useEffect(() => {
    if (toolResult && toolResult.letterIds) {
      setActiveLetterIds(toolResult.letterIds);
    }
  }, [toolResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-24 right-8 w-[450px] h-[700px] bg-white rounded-[2.5rem] shadow-[0_32px_96px_-16px_rgba(15,23,42,0.25)] border border-slate-100 flex flex-col z-[100] overflow-hidden"
    >
      {/* Premium Header */}
      <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-8 -mt-8" />
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary-teal flex items-center justify-center shadow-lg shadow-secondary-teal/20">
                   <Sparkles className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                   <h3 className="font-bold text-lg font-outfit leading-tight italic">FICO Geek AI</h3>
                   <div className="flex items-center gap-1.5 leading-none">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{isIntakeMode ? "Guided Intake Active" : "Knowledge Assistant"}</span>
                   </div>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="p-8 space-y-8 text-center">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
               <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
               <h4 className="text-xl font-bold text-primary-navy">I am FICO Geek AI</h4>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed italic border-l-2 border-slate-100 pl-4 mx-8">&quot;I provide educational guidance and help you draft professional dispute correspondence. How can I assist your workflow today?&quot;</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 px-4">
               <QuickAction label="What is Section 609?" onClick={() => handleInputChange({ target: { value: "What is Section 609?" } } as any)} />
               <QuickAction label="Where can I get my credit report?" onClick={() => handleInputChange({ target: { value: "Where can I get my credit report?" } } as any)} />
               <QuickAction label="How do I draft a dispute letter?" onClick={() => handleInputChange({ target: { value: "How do I draft a dispute letter?" } } as any)} />
            </div>
          </div>
        )}

        {messages.map((m) => (
          <AIBubble key={m.id} role={m.role as any} content={m.content} />
        ))}

        {toolResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] space-y-4"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                   <FileText className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-emerald-900">Letters Ready for Review</h4>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Drafts finalized &bull; Bureau Mapping Active</p>
                </div>
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditorOpen(true)}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                   Review & Refine <ExternalLink className="w-4 h-4" />
                </button>
             </div>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex gap-4 p-6 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0" />
            <div className="h-10 bg-slate-100 rounded-2xl w-2/3" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-slate-100 bg-white">
        <form 
          onSubmit={handleSubmit}
          className="relative group"
        >
          <input 
            value={input}
            onChange={handleInputChange}
            placeholder={isIntakeMode ? "Type your response..." : "Ask a platform question..."}
            className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 shadow-inner group-hover:border-slate-200"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-primary-navy text-white rounded-[1.5rem] shadow-xl shadow-navy-900/10 hover:bg-primary-navy-muted transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-3">
           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Educational guidance only &bull; Built by Sovereign Logic
           </div>
        </div>
      </div>
    </motion.div>
    
    <LetterEditorModal 
      isOpen={isEditorOpen}
      onClose={() => setIsEditorOpen(false)}
      letterIds={activeLetterIds}
    />
    </>
  );
}

function QuickAction({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left hover:border-primary-blue hover:text-primary-blue hover:shadow-xl hover:shadow-primary-blue/5 transition-all flex items-center justify-between group"
    >
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-primary-navy" />
    </button>
  );
}
