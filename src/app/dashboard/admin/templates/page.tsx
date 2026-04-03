"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Copy,
  Layout,
  Code,
  Zap,
  MoreVertical,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { AdminGuard } from "@/components/AdminGuard";
import { LetterTemplate } from "@/lib/schema";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user, profile, isAdminOrOwner } = useAuth();

  const fetchTemplates = useCallback(async () => {
    if (!user || !isAdminOrOwner) return;
    try {
      const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      if (editingTemplate.id) {
        await updateDoc(doc(db, "templates", editingTemplate.id), {
          ...editingTemplate,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, "templates"), {
          ...editingTemplate,
          active: true,
          placeholders: ["{{USER_NAME}}", "{{USER_ADDRESS}}", "{{CITY_STATE_ZIP}}", "{{DATE}}", "{{BUREAU_NAME}}", "{{BUREAU_ADDRESS}}", "{{ACCOUNT_NAME}}", "{{ACCOUNT_NUMBER}}", "{{DISPUTE_REASON}}", "{{DISPUTE_BODY}}", "{{SIGNATURE_NAME}}"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <Layout className="w-5 h-5 text-secondary-teal" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Template Forge</span>
            </div>
            <h1 className="text-4xl font-bold font-outfit text-primary-navy">Standard Letter Library</h1>
            <p className="text-slate-500 font-medium tracking-tight">Deploy and manage standardized dispute logic for all users.</p>
          </div>
          <button 
            onClick={() => {
              setEditingTemplate({ name: "", type: "Standard", category: "Dispute", body: "" });
              setIsEditing(true);
            }}
            className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl"
          >
            <Plus className="w-5 h-5" />
            <span>New Template Design</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main List */}
           <div className="lg:col-span-2 space-y-6">
              <div className="premium-card overflow-hidden">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative flex-1 max-w-md group">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Scan library..."
                         className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 font-bold text-slate-600 transition-all text-sm"
                       />
                    </div>
                 </div>

                 <div className="divide-y divide-slate-100">
                    {loading ? (
                       <div className="p-12 text-center text-slate-300 font-bold uppercase tracking-widest italic">Indexing library...</div>
                    ) : templates.length === 0 ? (
                       <div className="p-24 text-center">
                          <FileText className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Library is currently empty</p>
                       </div>
                    ) : (
                       templates.map((t) => (
                          <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group border-l-4 border-transparent hover:border-primary-blue">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:rotate-6 duration-500">
                                   <FileText className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                   <h3 className="font-bold text-lg text-slate-800">{t.name}</h3>
                                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <span className="text-primary-blue">{t.category}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span>{t.type}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Enabled</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => {
                                    setEditingTemplate(t);
                                    setIsEditing(true);
                                  }}
                                  className="p-3 text-slate-400 hover:text-primary-blue hover:bg-white rounded-xl transition-all shadow-sm"
                                >
                                   <Edit3 className="w-5 h-5" />
                                </button>
                                <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                   <Trash2 className="w-5 h-5" />
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>

           {/* Sidebar Controls */}
           <div className="space-y-8">
              <div className="premium-card p-8 bg-slate-900 border-none text-white space-y-6 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16" />
                 <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary-teal" />
                    <h3 className="font-bold text-lg leading-none">AI Refinement</h3>
                 </div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Use the Sovereign Logic engine to automatically adjust template tone for different bureaus.</p>
                 <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    Enable Logic Engine <ChevronRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="premium-card p-8 space-y-6">
                 <h3 className="font-bold text-xs font-outfit uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary-blue" /> Placeholder Syntax
                 </h3>
                 <div className="space-y-4">
                    <pre className="p-4 bg-slate-50 rounded-xl text-[10px] font-bold text-primary-navy border border-slate-100 overflow-x-auto">
                       {`{{USER_NAME}}
{{USER_ADDRESS}}
{{CITY_STATE_ZIP}}
{{BUREAU_NAME}}
{{BUREAU_ADDRESS}}
{{ACCOUNT_NAME}}
{{ACCOUNT_NUMBER}}
{{DISPUTE_REASON}}
{{DISPUTE_BODY}}
{{SIGNATURE_NAME}}
{{DATE}}`}
                    </pre>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">Placeholders are case-sensitive and must be wrapped in double curly braces.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Editor Modal */}
        {isEditing && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-primary-navy/40 backdrop-blur-md" onClick={() => setIsEditing(false)} />
              <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                 <form onSubmit={handleSave} className="flex flex-col h-[85vh]">
                    <div className="p-10 border-b border-slate-100 flex justify-between items-start">
                       <div className="space-y-2">
                          <h2 className="text-2xl font-bold font-outfit text-primary-navy">{editingTemplate.id ? "Edit Template" : "Construct Template"}</h2>
                          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Designing core correspondence logic</p>
                       </div>
                       <button type="button" onClick={() => setIsEditing(false)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                          <XCircle className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-8">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Internal Designation</label>
                             <input 
                               required
                               value={editingTemplate.name}
                               onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                               placeholder="e.g., Round 1 General Dispute"
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Deployment Category</label>
                             <select 
                               value={editingTemplate.category}
                               onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700"
                             >
                                <option>Dispute</option>
                                <option>Follow Up</option>
                                <option>Cease & Desist</option>
                                <option>Verification Request</option>
                             </select>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Letter Structure Body</label>
                          <textarea 
                            required
                            value={editingTemplate.body}
                            onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                            rows={12}
                            placeholder="Dear {{BUREAU_NAME}}, I am writing to dispute..."
                            className="w-full px-8 py-8 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-serif text-lg leading-relaxed text-slate-700 resize-none shadow-inner"
                          />
                       </div>
                    </div>

                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary-blue" /> Autocomplete Enabled
                       </p>
                       <div className="flex gap-4">
                          <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all">Cancel</button>
                          <button type="submit" className="px-12 py-4 bg-primary-navy text-white rounded-2xl font-bold shadow-xl shadow-navy-900/10 hover:bg-primary-navy-muted transition-all active:scale-95">Save Deployment</button>
                       </div>
                    </div>
                 </form>
              </div>
           </div>
        )}
      </div>
    </AdminGuard>
  );
}
