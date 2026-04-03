"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Handshake,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "profiles", user.uid), {
        name,
        updatedAt: new Date().toISOString()
      });
      setMessage({ type: 'success', text: "Profile updated successfully." });
    } catch (e) {
      setMessage({ type: 'error', text: "Failed to update profile." });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const enrollInPartnerProgram = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      // 1. Update Profile isPartner flag
      await updateDoc(doc(db, "profiles", user.uid), {
        isPartner: true,
        updatedAt: new Date().toISOString()
      });

      // 2. Initialize Partner Profile
      const initialPartner = {
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

      setMessage({ type: 'success', text: "Welcome to the Partner Program!" });
      // Reload or Redirect
      window.location.reload();
    } catch (e) {
      setMessage({ type: 'error', text: "Enrollment failed." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
           <ShieldCheck className="w-5 h-5 text-primary-blue" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Profile Management</span>
        </div>
        <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Account & Security</h1>
        <p className="text-slate-500 font-medium tracking-tight">Manage your professional identity, security credentials, and platform preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="space-y-8">
           <div className="premium-card p-10 text-center space-y-6 bg-slate-50/50 border-slate-100">
              <div className="relative inline-block group">
                 <div className="w-32 h-32 rounded-3xl bg-primary-blue/10 flex items-center justify-center text-primary-blue text-4xl font-bold border-2 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {profile?.name?.[0] || 'U'}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer shadow-lg hover:text-primary-blue transition-colors">
                    <Globe className="w-5 h-5" />
                 </div>
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-bold font-outfit text-primary-navy">{profile?.name}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{profile?.role} User</p>
              </div>
           </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 italic">Security Controls</h4>
               <Link href="/dashboard/settings/security" className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-blue/30 group transition-all">
                  <div className="flex items-center gap-3">
                     <Lock className="w-5 h-5 text-slate-400 group-hover:text-primary-blue" />
                     <span className="text-sm font-bold text-primary-navy italic uppercase">Vault Security</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary-blue" />
               </Link>
               <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-blue/30 group transition-all">
                  <div className="flex items-center gap-3">
                     <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary-blue" />
                     <span className="text-sm font-bold text-primary-navy italic uppercase">Alert Logic</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary-blue" />
               </button>
            </div>

            <div className="premium-card p-8 bg-primary-navy text-white space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-teal/10 blur-[30px] -mr-10 -mt-10" />
               <h4 className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest leading-none italic">Security Protocol</h4>
               <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider italic">Your PII is encrypted using military-grade AES-256 isolation. Ensure your session is secured when accessing from public networks.</p>
            </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2 space-y-10">
           {/* Profile Information */}
           <div className="premium-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                 <User className="w-6 h-6 text-primary-blue" />
                 <h3 className="text-xl font-bold font-outfit text-primary-navy">Identity</h3>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                       <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                       <input 
                         type="text" 
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white transition-all font-bold text-primary-navy"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 opacity-50">Email Address (Read Only)</label>
                    <div className="relative">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input 
                         type="email" 
                         value={profile?.email}
                         disabled
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-not-allowed font-bold text-slate-300 grayscale"
                       />
                    </div>
                 </div>

                 <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="btn-primary py-4 px-10 flex items-center gap-3 disabled:opacity-50"
                    >
                       {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                       <span>Save Changes</span>
                    </button>
                 </div>
              </form>
           </div>

           {/* Partner Program Opt-in */}
           {!profile?.isPartner ? (
              <div className="premium-card p-10 bg-gradient-to-br from-primary-navy to-slate-900 border-none text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/20 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary-blue/30 transition-all" />
                 <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                          <Handshake className="w-6 h-6 text-secondary-teal" />
                       </div>
                       <div className="space-y-0.5">
                          <h3 className="text-2xl font-bold font-outfit">Join the Partner Program</h3>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Monetize your network</p>
                       </div>
                    </div>

                    <p className="text-slate-300 font-medium leading-relaxed">Refer high-profile clients to FICO Geek and earn a recurring <span className="text-primary-blue font-bold italic">20% commission</span> on all their subscription payments. Permanent, passive revenue stream for credit industry professionals.</p>
                    
                    <div className="grid grid-cols-2 gap-4 pb-4">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Attribution</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net-30 Settlements</span>
                       </div>
                    </div>

                    <button 
                      onClick={enrollInPartnerProgram}
                      disabled={isUpdating}
                      className="w-full py-5 bg-white text-primary-navy rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />}
                       Activate Partner Dashboard
                    </button>
                 </div>
              </div>
           ) : (
              <div className="premium-card p-10 flex items-center justify-between border-emerald-100 bg-emerald-50/20 backdrop-blur-sm">
                 <div className="flex items-center gap-4 text-emerald-600">
                    <Award className="w-10 h-10" />
                    <div className="space-y-1">
                       <h3 className="text-xl font-bold font-outfit">Active Partner</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Your affiliate dashboard is unlocked</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => window.location.href = '/dashboard/partner'}
                    className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all font-bold text-sm"
                 >
                    Launch Portal
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
