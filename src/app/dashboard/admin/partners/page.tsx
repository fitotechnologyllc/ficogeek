"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Handshake, 
  TrendingUp, 
  BarChart3, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  DollarSign,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { PartnerProfile } from "@/lib/schema";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAffiliateRevenue, setTotalAffiliateRevenue] = useState(0);
  const { user, isAdminOrOwner } = useAuth();

  const fetchPartners = async () => {
    if (!isAdminOrOwner) return;
    try {
      const q = query(collection(db, "partners"), orderBy("totalRevenue", "desc"));
      const snap = await getDocs(q);
      const partnerData = snap.docs.map(d => d.data() as PartnerProfile);
      setPartners(partnerData);
      
      const total = partnerData.reduce((acc, p) => acc + p.totalRevenue, 0);
      setTotalAffiliateRevenue(total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const togglePartnerStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
    try {
      await updateDoc(doc(db, "partners", uid), { status: newStatus });
      fetchPartners();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-primary-blue" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Partner Control</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Affiliate Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Oversight and moderation for the FICO Geek influencer network.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="premium-card px-6 py-4 bg-primary-navy text-white flex items-center gap-4 shadow-2xl">
              <div className="space-y-0.5">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Partner Rev</p>
                 <p className="text-xl font-bold font-outfit tracking-tight">${totalAffiliateRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-emerald-400" />
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="premium-card p-8 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Partners</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-bold font-outfit text-primary-navy">{partners.filter(p => p.status === 'Active').length}</h3>
               <Users className="w-8 h-8 text-primary-blue/20" />
            </div>
         </div>
         <div className="premium-card p-8 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Payouts</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-bold font-outfit text-amber-600">${partners.reduce((acc, p) => acc + p.unpaidEarnings, 0).toLocaleString()}</h3>
               <DollarSign className="w-8 h-8 text-amber-200" />
            </div>
         </div>
         <div className="premium-card p-8 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Conversion</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-bold font-outfit text-primary-navy">12.4%</h3>
               <BarChart3 className="w-8 h-8 text-secondary-teal/20" />
            </div>
         </div>
      </div>

      {/* Partners Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search by Partner UID or Name..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Conversions</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Rev</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Com Rate</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
               {loading ? (
                 <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 italic">Syncing Affiliate Network...</td>
                 </tr>
               ) : partners.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 italic font-bold uppercase tracking-widest">No active partners detected</td>
                 </tr>
               ) : (
                 partners.map((p) => (
                   <tr key={p.uid} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-primary-navy text-white flex items-center justify-center font-bold">
                              {p.referralId.slice(0, 2)}
                           </div>
                           <div>
                              <p className="font-bold text-primary-navy">{p.referralId}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.uid.slice(0, 12)}...</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                           {p.status}
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <div className="space-y-1">
                           <p className="font-bold text-primary-navy">{p.totalSignups} Signups</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.totalClicks} Clicks</p>
                        </div>
                     </td>
                     <td className="px-8 py-6 font-bold text-primary-navy">
                        ${p.totalRevenue.toLocaleString()}
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-primary-blue">{p.commissionRate}%</span>
                           <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary-navy transition-colors">
                              <TrendingUp className="w-3 h-3" />
                           </button>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => togglePartnerStatus(p.uid, p.status)}
                             className={`p-2 rounded-lg transition-all ${
                               p.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                             }`}
                           >
                              {p.status === 'Active' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                           </button>
                           <button className="p-2 text-slate-400 hover:text-primary-navy transition-colors">
                              <ExternalLink className="w-5 h-5" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
