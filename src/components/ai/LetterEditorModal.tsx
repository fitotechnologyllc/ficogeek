"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  Printer, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  AlertCircle
} from "lucide-react";
import { LetterPreview } from "@/components/LetterPreview";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Letter } from "@/lib/schema";

interface LetterEditorModalProps {
  letterIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const LetterEditorModal: React.FC<LetterEditorModalProps> = ({ 
  letterIds, 
  isOpen, 
  onClose 
}) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [tempContent, setTempContent] = useState("");

  const currentLetter = letters[currentIndex];

  useEffect(() => {
    if (isOpen && letterIds.length > 0) {
      fetchLetters();
    }
  }, [isOpen, letterIds]);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const fetched = await Promise.all(
        letterIds.map(async (id) => {
          const snap = await getDoc(doc(db, "letters", id));
          return { id, ...snap.data() } as Letter;
        })
      );
      setLetters(fetched);
      setTempContent(fetched[0]?.content || "");
    } catch (err) {
      console.error("Fetch Letters Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentLetter) return;
    try {
      await updateDoc(doc(db, "letters", currentLetter.id!), {
        content: tempContent,
        updatedAt: new Date().toISOString()
      });
      const updated = [...letters];
      updated[currentIndex].content = tempContent;
      setLetters(updated);
      setEditing(false);
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleRefineWithAI = async () => {
    setRefining(true);
    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempContent })
      });
      const data = await res.json();
      if (data.success) {
        setTempContent(data.refinedContent);
        // We don't save yet, let the user review
      }
    } catch (err) {
      console.error("Refine Error:", err);
    } finally {
      setRefining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-navy/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[95vw] h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-blue text-white flex items-center justify-center shadow-lg shadow-primary-blue/20">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-bold font-outfit text-primary-navy">Review & Refine Letters</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-secondary-teal" /> Sovereign Logic Layer Active
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                 <button 
                   onClick={() => {
                     const next = Math.max(0, currentIndex - 1);
                     setCurrentIndex(next);
                     setTempContent(letters[next].content);
                   }}
                   disabled={currentIndex === 0}
                   className="p-1 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 <span className="text-sm font-bold text-slate-500 tabular-nums">Letter {currentIndex + 1} of {letters.length}</span>
                 <button 
                   onClick={() => {
                     const next = Math.min(letters.length - 1, currentIndex + 1);
                     setCurrentIndex(next);
                     setTempContent(letters[next].content);
                   }}
                   disabled={currentIndex === letters.length - 1}
                   className="p-1 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
              <button onClick={onClose} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                 <X className="w-7 h-7" />
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Sidebar */}
          <div className="w-full max-w-md border-r border-slate-100 bg-slate-50/50 p-8 overflow-y-auto space-y-8">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-primary-blue" /> Smart Editor
                   </h3>
                   {!editing ? (
                      <button onClick={() => setEditing(true)} className="text-xs font-bold text-primary-blue hover:underline">Manual Edit</button>
                   ) : (
                      <button onClick={handleSave} className="text-xs font-bold text-emerald-500 hover:underline">Save Draft</button>
                   )}
                </div>
                
                <div className="relative">
                   <textarea 
                     readOnly={!editing}
                     value={tempContent}
                     onChange={(e) => setTempContent(e.target.value)}
                     className={`w-full h-[60vh] p-6 rounded-[2rem] border-2 outline-none transition-all font-serif leading-relaxed text-slate-700 shadow-inner ${
                       editing 
                         ? "bg-white border-primary-blue/30 focus:border-primary-blue ring-4 ring-primary-blue/5" 
                         : "bg-transparent border-transparent resize-none cursor-default"
                     }`}
                     placeholder="Letter content loading..."
                   />
                   {refining && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-4">
                         <div className="w-10 h-10 border-4 border-secondary-teal border-t-transparent rounded-full animate-spin" />
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Polishing Tone...</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="space-y-4">
                <button 
                  onClick={handleRefineWithAI}
                  disabled={refining}
                  className="w-full py-4 bg-primary-navy text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-navy-muted transition-all disabled:opacity-50"
                >
                   <Sparkles className="w-5 h-5 text-secondary-teal" /> AI Refine Narrative
                </button>
                <p className="text-[10px] text-center font-medium text-slate-400 px-4">This uses the FCRA Section 609 Engine to adjust the tone of your dispute for maximum clarity.</p>
             </div>
          </div>

          {/* Large Preview */}
          <div className="flex-1 p-8 bg-slate-100/50 overflow-y-auto">
             {loading ? (
                <div className="h-full flex items-center justify-center flex-col gap-6">
                   <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Assembling Document Stack...</p>
                </div>
             ) : currentLetter ? (
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                   <div className="flex justify-between items-center px-4">
                      <div className="flex items-center gap-3">
                         <Zap className="w-5 h-5 text-amber-500" />
                         <span className="text-sm font-bold text-slate-600">Previewing Draft for <span className="text-primary-navy uppercase font-black">{currentLetter.bureau}</span></span>
                      </div>
                      <div className="flex gap-3">
                         <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                            <Download className="w-4 h-4" /> Download PDF
                         </button>
                         <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-8 py-3 bg-primary-navy text-white rounded-xl font-bold shadow-xl shadow-navy-200 transition-all"
                         >
                            <Printer className="w-4 h-4" /> Print Final Letter
                         </button>
                      </div>
                   </div>
                   
                   <LetterPreview 
                      content={tempContent}
                      recipient={currentLetter.bureau}
                      address={currentLetter.metadata.address}
                      date={new Date(currentLetter.metadata.date).toLocaleDateString()}
                      subject={`Dispute Regarding ${currentLetter.type} Item`}
                      userName={currentLetter.metadata.recipient || "Consumer Name"} // Fallback logic
                   />
                   
                   <div className="premium-card p-6 border-amber-100 bg-amber-50/50 flex gap-4">
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                         <p className="text-xs font-bold text-amber-800 uppercase tracking-tight mb-1">Final Verification Checklist</p>
                         <ul className="text-[11px] text-amber-700 font-medium space-y-1 list-disc ml-4">
                            <li>Ensure your full account number is visible or appropriately masked.</li>
                            <li>Verify the bureau address matches the official service center.</li>
                            <li>Include copies of your ID and utility bill when mailing.</li>
                         </ul>
                      </div>
                   </div>
                </div>
             ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
