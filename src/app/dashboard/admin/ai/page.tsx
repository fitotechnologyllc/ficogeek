"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Sparkles, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  BookOpen, 
  Zap, 
  ShieldAlert,
  ChevronRight,
  Save,
  MessageSquare,
  Activity
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminAIPage() {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>({ category: "General", question: "", answer: "" });
  const { user, profile, isAdminOrOwner } = useAuth();

  const fetchKnowledge = useCallback(async () => {
    if (!user || !isAdminOrOwner) return;
    try {
      const q = query(collection(db, "ai_knowledge"), orderBy("lastUpdated", "desc"));
      const snapshot = await getDocs(q);
      setKnowledge(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoc.id) {
        await updateDoc(doc(db, "ai_knowledge", editingDoc.id), {
          ...editingDoc,
          lastUpdated: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, "ai_knowledge"), {
          ...editingDoc,
          lastUpdated: new Date().toISOString()
        });
      }
      setIsEditing(false);
      setEditingDoc({ category: "General", question: "", answer: "" });
      fetchKnowledge();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 max-w-7xl mx-auto">
        <>
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Settings className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Control Hub</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">AI Logic Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure conversational boundaries, knowledge retrieval, and system personas.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => { setEditingDoc({ category: "General", question: "", answer: "" }); setIsEditing(true); }}
             className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl"
           >
             <Plus className="w-5 h-5" />
             <span>Seed Knowledge</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Knowledge Base */}
         <div className="lg:col-span-2 space-y-6">
            <div className="premium-card overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="relative flex-1 max-w-md group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Scan intelligence units..."
                       className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 font-bold text-slate-600 transition-all text-sm"
                     />
                  </div>
               </div>

               <div className="divide-y divide-slate-100">
                  {loading ? (
                     <div className="p-12 text-center text-slate-300 font-bold italic tracking-widest uppercase">Fetching logic units...</div>
                  ) : knowledge.length === 0 ? (
                     <div className="p-24 text-center">
                        <BookOpen className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No knowledge active</p>
                     </div>
                  ) : (
                     knowledge.map((k) => (
                        <div key={k.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-primary-blue">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:rotate-6 duration-500">
                                 <MessageSquare className="w-7 h-7" />
                              </div>
                              <div className="space-y-1">
                                 <h3 className="font-bold text-lg text-slate-800">{k.question}</h3>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-primary-blue">{k.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-secondary-teal" /> Indexed</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <button 
                                onClick={() => { setEditingDoc(k); setIsEditing(true); }}
                                className="p-3 text-slate-400 hover:text-primary-blue hover:bg-white rounded-xl transition-all shadow-sm"
                              >
                                 <Edit3 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>

         {/* Stats & Global Config */}
         <div className="space-y-8">
            <div className="premium-card p-8 bg-slate-900 border-none text-white space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/10 blur-[40px] -mr-8 -mt-8" />
               <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 italic">
                     <Zap className="w-5 h-5 text-primary-blue" /> System Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <StatBlock label="Daily Convos" val="142" />
                     <StatBlock label="Token Usage" val="12.4k" />
                     <StatBlock label="Intake %" val="64%" />
                     <StatBlock label="Safety Hits" val="0" />
                  </div>
               </div>
               
               <div className="pt-6 border-t border-white/10 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Global Persona Config</h4>
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                     <span className="text-xs font-bold text-slate-300">Trust-First Mode</span>
                     <div className="w-10 h-6 bg-secondary-teal rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-slate-900 rounded-full translate-x-4" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="premium-card p-8 border-dashed border-2 border-slate-100 space-y-6">
               <h3 className="font-bold text-xs font-outfit uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Prompt Guardrails
               </h3>
               <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4">&quot;All knowledge snippets are injected into the system prompt. Ensure no absolute guarantees or legal advice are included in responses.&quot;</p>
            </div>
         </div>
      </div>
        </>

      {/* Seeding Modal */}
      {isEditing && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-navy/40 backdrop-blur-md" onClick={() => setIsEditing(false)} />
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
               <form onSubmit={handleSave} className="flex flex-col h-[70vh]">
                  <div className="p-10 border-b border-slate-100 flex justify-between items-start">
                     <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-outfit text-primary-navy">{editingDoc.id ? "Modify Logic Unit" : "Seed Intelligence"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Knowledge retrieval definition</p>
                     </div>
                     <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-slate-300 hover:text-red-500">
                        <Trash2 className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="flex-1 p-10 space-y-8 overflow-y-auto">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Deployment Category</label>
                           <select 
                              value={editingDoc.category}
                              onChange={(e) => setEditingDoc({...editingDoc, category: e.target.value})}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white transition-all shadow-inner"
                           >
                              <option>General</option>
                              <option>Section 609</option>
                              <option>App Guide</option>
                              <option>Dispute Logic</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Primary Question Slug</label>
                           <input 
                              required
                              value={editingDoc.question}
                              onChange={(e) => setEditingDoc({...editingDoc, question: e.target.value})}
                              placeholder="e.g., What is Section 609?"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white transition-all shadow-inner"
                           />
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Intelligence Response Answer</label>
                        <textarea 
                           required
                           value={editingDoc.answer}
                           onChange={(e) => setEditingDoc({...editingDoc, answer: e.target.value})}
                           rows={8}
                           placeholder="Enter the canonical educational answer..."
                           className="w-full px-8 py-8 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-medium text-slate-700 leading-relaxed resize-none focus:bg-white transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                     <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all">Abort</button>
                     <button type="submit" className="px-12 py-4 bg-primary-navy text-white rounded-2xl font-bold shadow-xl shadow-navy-900/10 hover:bg-primary-navy-muted transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" /> Commit Knowledge
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
    </AdminGuard>
  );
}

function StatBlock({ label, val }: any) {
  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
       <p className="text-xl font-bold text-white leading-none italic font-outfit">{val}</p>
    </div>
  );
}
