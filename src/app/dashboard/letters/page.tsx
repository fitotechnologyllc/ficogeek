"use client";

import { useEffect, useState } from "react";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Download, 
  Printer, 
  MoreVertical, 
  ShieldCheck, 
  ArrowRight,
  Archive,
  History,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { LetterPreview } from "@/components/LetterPreview";
import { Letter } from "@/lib/schema";
import { formatDisplayDate } from "@/lib/utils";

export default function LetterCenterPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "preview">("list");
  const { user } = useAuth();

  const fetchLetters = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "letters"), 
        where("ownerUID", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setLetters(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Letter)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [user]);

  if (viewMode === "preview" && selectedLetter) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
         <button 
           onClick={() => setViewMode("list")}
           className="flex items-center gap-2 text-slate-400 hover:text-primary-blue font-bold px-4 py-2 transition-all"
         >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Library
         </button>
         <LetterPreview 
           content={selectedLetter.content}
          recipient={selectedLetter.metadata?.recipient || "N/A"}
          address={selectedLetter.metadata?.address || "N/A"}
          date={selectedLetter.metadata?.date || formatDisplayDate(selectedLetter.createdAt)}
          subject={selectedLetter.type}
          userName={user?.displayName || "Sovereign User"}
         />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Drafting & Archive Services</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Letter Library</h1>
          <p className="text-slate-500 font-medium tracking-tight">Your secure archive of {letters.length} generated dispute correspondences.</p>
        </div>
        <button className="btn-primary group flex items-center gap-2 py-4 px-8 shadow-2xl">
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Generate New Letter</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 premium-card overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <div className="relative flex-1 max-w-md group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search correspondence..."
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700"
                  />
               </div>
            </div>

            <div className="divide-y divide-slate-100">
               {loading ? (
                  <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest italic">Indexing archives...</div>
               ) : letters.length === 0 ? (
                  <div className="p-32 text-center space-y-8">
                     <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 border-8 border-white shadow-xl rotate-6">
                        <FileText className="w-12 h-12" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-slate-300 uppercase font-outfit tracking-tight">No active correspondence</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Create a dispute to generate your first professional letter.</p>
                     </div>
                  </div>
               ) : (
                  letters.map((l) => (
                    <div key={l.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 group transition-all border-l-4 border-transparent hover:border-primary-blue">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:rotate-3 duration-500">
                             <FileText className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors">{l.type}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                                  l.status === 'Sent' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary-blue/5 text-primary-blue border-primary-blue/10"
                                }`}>
                                   {l.status}
                                </span>
                             </div>
                             <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {l.bureau} Management</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-1.5 text-primary-navy/40 italic"><History className="w-3.5 h-3.5" /> v{l.version || 1.0}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 mt-6 md:mt-0">
                          <button 
                            onClick={() => { setSelectedLetter(l); setViewMode("preview"); }}
                            className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-primary-blue hover:shadow-xl rounded-2xl transition-all flex items-center gap-2 group/btn"
                          >
                             <Printer className="w-5 h-5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover/btn:block animate-in slide-in-from-right-2">Quick Print</span>
                          </button>
                          <button className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-primary-navy hover:shadow-xl rounded-2xl transition-all">
                             <Download className="w-5 h-5" />
                          </button>
                          <button className="p-3.5 bg-white border border-slate-100 text-slate-300 hover:text-red-500 rounded-2xl transition-all">
                             <Archive className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  ))
               )}
            </div>
         </div>

         {/* Sidebar / Stats */}
         <div className="space-y-8">
            <div className="premium-card p-8 bg-slate-900 border-none text-white space-y-6 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/10 blur-[40px] -mr-8 -mt-8" />
               <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-blue" />
                  <h3 className="font-bold text-lg leading-none">Activity Feed</h3>
               </div>
               <div className="space-y-6 relative z-10">
                  <ActivityItem label="Sent to Equifax" time="2h ago" type="SUCCESS" />
                  <ActivityItem label="Drafted Follow Up" time="Yesterday" type="DRAFT" />
                  <ActivityItem label="Profile Update" time="March 28" type="SYSTEM" />
               </div>
               <button className="w-full py-4 bg-white/5 border border-white/20 rounded-2xl font-bold uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all">
                  Full Logic Audit
               </button>
            </div>

            <div className="premium-card p-8 space-y-6 border-dashed border-2 border-slate-100">
               <div className="flex items-center gap-2 text-primary-blue mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Security Advisory</h4>
               </div>
               <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">&quot;Ensure you have verified the recipient address for all Bureau correspondence before generating final PDFs to prevent signature mismatch.&quot;</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function ActivityItem({ label, time, type }: { label: string; time: string; type: 'SUCCESS' | 'DRAFT' | 'SYSTEM' }) {
  return (
    <div className="flex justify-between items-center group">
       <div className="space-y-0.5">
          <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{time}</p>
       </div>
       <div className={`w-2 h-2 rounded-full ${
         type === 'SUCCESS' ? 'bg-emerald-500' : type === 'DRAFT' ? 'bg-amber-500' : 'bg-primary-blue'
       }`} />
    </div>
  );
}
