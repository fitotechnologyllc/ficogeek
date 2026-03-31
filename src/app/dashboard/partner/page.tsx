"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  Users, 
  MousePointer2, 
  DollarSign, 
  Copy, 
  PlusCircle, 
  TrendingUp, 
  History, 
  ArrowRight,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Gift
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, setDoc, addDoc } from "firebase/firestore";
import { PartnerProfile, Referral, Commission, CouponCode } from "@/lib/schema";

export default function PartnerDashboard() {
  const { user, profile } = useAuth();
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPartnerData = async () => {
    if (!user) return;
    try {
      const pDoc = await getDoc(doc(db, "partners", user.uid));
      if (pDoc.exists()) {
        setPartner(pDoc.data() as PartnerProfile);
      } else {
        // Initialize Partner Record if first time but already marked as partner
        if (profile?.isPartner) {
           const initialPartner: PartnerProfile = {
             uid: user.uid,
             referralId: user.uid.slice(0, 8).toUpperCase(),
             status: "Active",
             commissionRate: 20,
             totalClicks: 0,
             totalSignups: 0,
             totalRevenue: 0,
             totalEarnings: 0,
             unpaidEarnings: 0,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           };
           await setDoc(doc(db, "partners", user.uid), initialPartner);
           setPartner(initialPartner);
        }
      }

      // Fetch Recent Referrals
      const refQ = query(collection(db, "referrals"), where("partnerUID", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
      const refSnap = await getDocs(refQ);
      setReferrals(refSnap.docs.map(d => d.data() as Referral));

      // Fetch Recent Commissions
      const comQ = query(collection(db, "commissions"), where("partnerUID", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
      const comSnap = await getDocs(comQ);
      setCommissions(comSnap.docs.map(d => d.data() as Commission));

      // Fetch Coupons
      const coupQ = query(collection(db, "coupon_codes"), where("partnerUID", "==", user.uid));
      const coupSnap = await getDocs(coupQ);
      setCoupons(coupSnap.docs.map(d => d.data() as CouponCode));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, [user, profile]);

  const copyRefLink = () => {
    if (!partner) return;
    const url = `${window.location.origin}/signup?ref=${partner.uid}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-32 text-center animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Decrypting Affiliate Data...</p>
      </div>
    );
  }

  if (!profile?.isPartner) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
         <div className="premium-card p-12 text-center space-y-8 bg-gradient-to-br from-primary-navy to-slate-900 border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/10 blur-[100px] -mr-32 -mt-32" />
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-2xl">
               <ShieldCheck className="w-10 h-10 text-secondary-teal" />
            </div>
            <div className="space-y-4 relative z-10">
               <h1 className="text-4xl font-bold font-outfit tracking-tight">Join the Partner Program</h1>
               <p className="text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">Promote the world&apos;s most secure credit dispute workspace and earn <span className="text-primary-blue font-bold italic">20% recurring commissions</span> on every user you refer.</p>
            </div>
            <button className="btn-primary py-4 px-10 relative z-10 shadow-2xl hover:scale-105 active:scale-95 transition-all text-white bg-primary-blue border-none">
               Apply to Become a Partner
            </button>
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5 relative z-10">
               <div className="space-y-1">
                  <p className="text-2xl font-bold text-white font-outfit">20%</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recurring Pay</p>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-bold text-white font-outfit">Net-30</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Payout Cycle</p>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-bold text-white font-outfit">∞ Unlim</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Earning Cap</p>
               </div>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Zap className="w-5 h-5 text-amber-500" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none text-highlight">Influencer Growth Hub</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Partner Program</h1>
          <p className="text-slate-500 font-medium tracking-tight">Your unique referral console for the FICO Geek ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-primary-navy rounded-2xl transition-all shadow-sm">
             <Calendar className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowCouponModal(true)}
            className="btn-primary group flex items-center gap-3 py-4 px-8 shadow-2xl bg-secondary-teal text-primary-navy border-none hover:bg-secondary-teal-muted"
          >
            <Gift className="w-5 h-5" />
            <span>Generate Code</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Clicks" value={partner?.totalClicks.toLocaleString() || "0"} icon={MousePointer2} color="text-primary-blue" />
         <StatCard label="Total Signups" value={partner?.totalSignups.toLocaleString() || "0"} icon={Users} color="text-secondary-teal" />
         <StatCard label="Earned Commissions" value={`$${partner?.totalEarnings.toLocaleString() || "0.00"}`} icon={TrendingUp} color="text-emerald-500" />
         <StatCard label="Unpaid Balance" value={`$${partner?.unpaidEarnings.toLocaleString() || "0.00"}`} icon={DollarSign} color="text-amber-500" isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Tools & History */}
         <div className="lg:col-span-2 space-y-8">
            {/* Referral Link Tool */}
            <div className="premium-card p-10 bg-slate-900 border-none text-white relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-blue/5 to-transparent pointer-events-none" />
               <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-center">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold font-outfit">Your Referral Bridge</h3>
                        <p className="text-slate-400 text-sm font-medium">Use this link in your social bio or website tutorials.</p>
                     </div>
                     <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                        <Copy className="w-6 h-6 text-primary-blue" />
                     </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 group-hover:border-primary-blue/30 transition-colors">
                     <div className="flex-1 bg-transparent border-none outline-none text-slate-300 font-bold px-4 tracking-tighter truncate">
                        {`${window.location.origin}/signup?ref=${partner?.uid}`}
                     </div>
                     <button 
                       onClick={copyRefLink}
                       className={`px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                         copied ? "bg-emerald-500 text-white" : "bg-primary-blue hover:bg-primary-blue-muted text-white"
                       }`}
                     >
                        {copied ? "Copied!" : "Copy Link"}
                     </button>
                  </div>
               </div>
            </div>

            {/* Recent Ledger */}
            <div className="premium-card overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-bold text-primary-navy font-outfit text-xl">Recent Commissions</h3>
                  <button className="text-[10px] font-bold text-primary-blue uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                     View Ledger <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
               <div className="divide-y divide-slate-100">
                  {commissions.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                       <History className="w-10 h-10 text-slate-200 mx-auto" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No transaction history found</p>
                    </div>
                  ) : (
                    commissions.map((c, i) => (
                      <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                               <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-sm font-bold text-primary-navy">Subscription Upgrade</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User {c.referredUserUID.slice(0, 8)}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600 font-outfit group-hover:scale-105 transition-transform">+${c.commissionAmount.toFixed(2)}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.status}</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>

         {/* Side Cards */}
         <div className="space-y-8">
            <div className="premium-card p-8 bg-gradient-to-br from-secondary-teal/5 to-transparent border-secondary-teal/10 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-teal text-primary-navy flex items-center justify-center">
                     <DollarSign className="w-5 h-5 font-bold" />
                  </div>
                  <h3 className="font-bold text-primary-navy font-outfit text-lg">Payout Console</h3>
               </div>
               <div className="space-y-4 pb-4 border-b border-slate-100">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Settlement Mode</span>
                     <span className="text-secondary-teal">PayPal (Linked)</span>
                  </div>
               </div>
               <button 
                 disabled={partner?.unpaidEarnings === 0}
                 className="w-full py-4 bg-primary-navy text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-primary-navy-muted active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
               >
                  Request Settlement
               </button>
            </div>

            <div className="premium-card p-8 space-y-6 border-dashed border-2 border-slate-200">
               <div className="flex items-center gap-3 text-amber-500 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold uppercase tracking-[0.2em] text-[10px]">Security Advisory</h4>
               </div>
               <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">&quot;Commission attribution is locked to the original session identifier. Self-referral logic is monitored and will result in permanent disqualification from the ledger.&quot;</p>
            </div>

            {/* Coupons Summary */}
            <div className="premium-card p-8 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-primary-navy flex items-center gap-2"> <Gift className="w-4 h-4 text-secondary-teal" /> Active Codes</h4>
                   <span className="text-primary-blue text-[10px] font-bold">Manage All</span>
                </div>
                <div className="space-y-3">
                   {coupons.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No coupons generated yet</p>
                   ) : (
                     coupons.map(c => (
                       <div key={c.code} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-primary-navy text-[10px] uppercase tracking-widest">{c.code}</span>
                          <span className="text-secondary-teal font-bold text-[10px]">{c.discountValue}% OFF</span>
                       </div>
                     ))
                   )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, isHighlight = false }: any) {
  return (
    <div className={`premium-card p-8 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 ${isHighlight ? "border-primary-blue/30 shadow-2xl" : ""}`}>
       <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</span>
          <div className={`w-10 h-10 rounded-xl bg-slate-50 ${color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
             <Icon className="w-5 h-5 pointer-events-none" />
          </div>
       </div>
       <p className="text-3xl font-bold font-outfit text-primary-navy tracking-tight">{value}</p>
    </div>
  );
}
