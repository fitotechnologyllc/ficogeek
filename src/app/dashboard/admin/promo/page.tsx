"use client";

import { useEffect, useState } from "react";
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Copy,
  Calendar,
  Users,
  Zap,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Archive,
  BarChart3,
  Clock,
  Infinity
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { PromoCode, PromoDuration, PromoStatus } from "@/lib/schema";
import { createPromoCodeAction } from "@/app/actions/promo";
import { motion, AnimatePresence } from "framer-motion";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: "",
    status: "active",
    accessType: "PLAN",
    targetPlan: "premium",
    durationType: "30_days",
    maxRedemptions: 100,
    perUserLimit: 1,
    isUnlimitedDuration: false
  });

  const { user, profile, isAdminOrOwner } = useAuth();

  useEffect(() => {
    if (!user || !isAdminOrOwner) return;

    const q = query(collection(db, "promo_codes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPromos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdminOrOwner]);



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPromoCodeAction(formData, user!.uid, profile?.name || "Admin");
    if (result.success) {
      setIsEditing(false);
      setFormData({
        code: "",
        status: "active",
        accessType: "PLAN",
        targetPlan: "premium",
        durationType: "30_days",
        maxRedemptions: 100,
        perUserLimit: 1,
        isUnlimitedDuration: false
      });
    } else {
      alert(result.error);
    }
  };

  const getDurationLabel = (promo: PromoCode) => {
    if (promo.isUnlimitedDuration) return "Unlimited";
    return promo.durationType.replace("_", " ");
  };

  const getStatusColor = (status: PromoStatus) => {
    switch (status) {
      case "active": return "text-emerald-500 bg-emerald-50 border-emerald-100";
      case "inactive": return "text-amber-500 bg-amber-50 border-amber-100";
      case "expired": return "text-red-500 bg-red-50 border-red-100";
      case "archived": return "text-slate-400 bg-slate-50 border-slate-100";
      default: return "text-slate-400 bg-slate-50 border-slate-100";
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Ticket className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Promotion Engine</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Promo Code Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Generate and audit secure access tokens for premium platform tiers.</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl"
        >
          <Plus className="w-5 h-5" />
          <span>Generate New Code</span>
        </button>
      </div>

      {/* Stats Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard label="Active Codes" value={promos.filter(p => p.status === 'active').length} icon={Ticket} color="text-primary-blue" />
         <StatCard label="Total Redemptions" value={promos.reduce((acc, p) => acc + (p.redemptionCount || 0), 0)} icon={Users} color="text-emerald-500" />
         <StatCard label="Unlimited Passes" value={promos.filter(p => p.isUnlimitedDuration).length} icon={Infinity} color="text-purple-500" />
         <StatCard label="Archived" value={promos.filter(p => p.status === 'archived').length} icon={Archive} color="text-slate-400" />
      </div>

      <div className="grid grid-cols-1 gap-8">
         {/* Main List */}
         <div className="premium-card overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="relative flex-1 max-w-md group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by code..."
                    className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 font-bold text-slate-600 transition-all text-sm"
                  />
               </div>
            </div>

            <div className="divide-y divide-slate-100">
               {loading ? (
                  <div className="p-12 text-center text-slate-300 font-bold uppercase tracking-widest italic">Indexing codes...</div>
               ) : promos.length === 0 ? (
                  <div className="p-24 text-center">
                     <Ticket className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No promo codes generated yet</p>
                  </div>
               ) : (
                  promos.map((p) => (
                     <div key={p.id} className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group border-l-4 border-transparent hover:border-primary-blue">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:-rotate-6 duration-500">
                              <Ticket className="w-7 h-7" />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                 <h3 className="font-bold text-lg text-slate-800 tracking-wider uppercase font-mono">{p.code}</h3>
                                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter border ${getStatusColor(p.status)}`}>
                                    {p.status}
                                 </span>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span className="text-primary-blue flex items-center gap-1"><Zap className="w-3 h-3" /> {p.targetPlan} access</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getDurationLabel(p)}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                                 <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.redemptionCount} / {p.maxRedemptions} used</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button className="p-3 text-slate-400 hover:text-primary-blue hover:bg-white rounded-xl transition-all shadow-sm">
                              <Edit3 className="w-5 h-5" />
                           </button>
                           <button className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                              <MoreVertical className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>

      {/* Generation Modal */}
      <AnimatePresence>
        {isEditing && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary-navy/40 backdrop-blur-md" 
                onClick={() => setIsEditing(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                 <form onSubmit={handleCreate} className="flex flex-col">
                    <div className="p-10 border-b border-slate-100 flex justify-between items-start">
                       <div className="space-y-2">
                          <h2 className="text-2xl font-bold font-outfit text-primary-navy tracking-tight">Generate Promo Token</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defining access parameters</p>
                       </div>
                       <button type="button" onClick={() => setIsEditing(false)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                          <XCircle className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 font-mono">Token String</label>
                          <input 
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            placeholder="e.g., FREEMONTH30"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 tracking-widest uppercase text-xl placeholder:tracking-normal placeholder:font-sans"
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Access Level</label>
                             <select 
                               value={formData.targetPlan}
                               onChange={(e) => setFormData({...formData, targetPlan: e.target.value as any})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 shadow-sm"
                             >
                                <option value="premium">Premium Access</option>
                                <option value="pro">Pro Access</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Duration Type</label>
                             <select 
                               value={formData.durationType}
                               onChange={(e) => setFormData({...formData, durationType: e.target.value as any, isUnlimitedDuration: e.target.value === 'unlimited'})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 shadow-sm"
                             >
                                <option value="7_days">7 Days</option>
                                <option value="14_days">14 Days</option>
                                <option value="30_days">30 Days</option>
                                <option value="unlimited">Unlimited Duration</option>
                             </select>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Max Total Uses</label>
                             <input 
                               type="number"
                               value={formData.maxRedemptions}
                               onChange={(e) => setFormData({...formData, maxRedemptions: parseInt(e.target.value)})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 shadow-sm"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Uses Per User</label>
                             <input 
                               type="number"
                               value={formData.perUserLimit}
                               onChange={(e) => setFormData({...formData, perUserLimit: parseInt(e.target.value)})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 shadow-sm"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                       <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all">Discard</button>
                       <button type="submit" className="px-12 py-4 bg-primary-navy text-white rounded-2xl font-bold shadow-xl shadow-navy-900/10 hover:bg-primary-navy-muted transition-all active:scale-95">Finalize Token</button>
                    </div>
                 </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  </AdminGuard>
);
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number|string, icon: any, color: string }) {
  return (
    <div className="premium-card p-6 flex items-center gap-4">
       <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center ${color} shadow-inner`}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 font-outfit">{value}</p>
       </div>
    </div>
  );
}
