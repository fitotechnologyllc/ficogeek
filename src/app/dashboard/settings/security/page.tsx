"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  ArrowLeft, 
  History, 
  Loader2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";
import { formatDisplayDate } from "@/lib/utils";

export default function SecurityPage() {
  const { user, profile } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "audit_logs"),
        where("actorUID", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      setAuditLogs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 font-outfit">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary-navy">Security Controls</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your account security and authentication methods.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Helper Sidebar */}
        <div className="space-y-6">
           <div className="premium-card p-6 border-2 border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-800">Security State</h3>
              </div>
              <p className="text-2xl font-bold text-primary-navy mb-1">Standard</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                 Multi-Factor Auth Restricted
              </p>
           </div>

           <div className="premium-card p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Privacy First</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">FICO Geek is currently preparing a custom, high-security 2FA system to protect your financial data.</p>
           </div>
        </div>

        {/* Main Placeholder Section */}
        <div className="lg:col-span-2">
           <div className="premium-card p-10 flex flex-col items-center text-center space-y-8 min-h-[400px] justify-center border-dashed border-2 border-slate-200 bg-slate-50/20">
              <div className="w-20 h-20 bg-primary-blue/5 text-primary-blue rounded-[2.5rem] flex items-center justify-center shadow-inner">
                 <Clock className="w-10 h-10 animate-pulse" />
              </div>
              
              <div className="space-y-3 max-w-sm">
                 <h3 className="text-2xl font-bold text-primary-navy">Two-Factor Authentication</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">
                    A custom authenticator-based 2FA system is being prepared for FICO Geek. Account security settings will be available here once the setup is finalized.
                 </p>
              </div>

              <div className="pt-4">
                 <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Coming Soon to Dashboard</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Activity Table - Preserved but Neutral */}
      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <History className="w-6 h-6 text-slate-400" />
             <h2 className="text-2xl font-bold text-primary-navy">Recent Security Activity</h2>
          </div>

          <div className="premium-card overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {logsLoading ? (
                        <tr>
                           <td colSpan={3} className="px-8 py-12 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-200" />
                           </td>
                        </tr>
                      ) : auditLogs.length === 0 ? (
                        <tr>
                           <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-slate-400 italic">
                              No recent activity detected.
                           </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                           <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4">
                                 <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-100 rounded text-slate-600 group-hover:bg-primary-blue group-hover:text-white transition-colors">
                                    {(log.action || 'Unknown').replace(/_/g, ' ')}
                                 </span>
                              </td>
                              <td className="px-8 py-4 text-sm font-medium text-slate-600">
                                 {log.summary || "No details available"}
                              </td>
                              <td className="px-8 py-4 text-[10px] font-bold text-slate-400 text-right uppercase">
                                 {formatDisplayDate(log.timestamp)}
                              </td>
                           </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}
