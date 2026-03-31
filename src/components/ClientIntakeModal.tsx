"use client";

import React, { useState } from "react";
import { 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  Plus, 
  MessageSquare,
  Clock,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { logAuditAction } from "@/lib/audit";

interface ClientIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientIntakeModal: React.FC<ClientIntakeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    serviceLevel: "Standard",
    status: "Prospect"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const clientData = {
        ...formData,
        proUID: user.uid,
        onboardingStatus: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "clients"), clientData);

      await logAuditAction(
        user.uid,
        profile?.name || user.email!,
        profile?.role || "pro",
        "CLIENT_CREATED",
        `Created new client: ${formData.name}`,
        "CLIENT",
        docRef.id,
        { email: formData.email }
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-primary-navy/40 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Overlay */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <UserPlus className="w-64 h-64" />
        </div>

        <div className="relative p-10 md:p-14 space-y-10">
           <div className="flex justify-between items-start">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Pro Workspace
                 </div>
                 <h2 className="text-3xl font-bold font-outfit text-primary-navy leading-none">New Client Intake</h2>
                 <p className="text-slate-500 font-medium">Add a new client to your professional dispute pipeline.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-300 hover:text-primary-navy hover:bg-slate-100 rounded-2xl transition-all"
              >
                 <X className="w-6 h-6" />
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Legal Name</label>
                    <div className="relative group">
                       <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                       <input 
                         required
                         type="text"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         placeholder="John Q. Client"
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                    <div className="relative group">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                       <input 
                         required
                         type="email"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         placeholder="client@example.com"
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <div className="relative group">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                       <input 
                         type="tel"
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         placeholder="+1 (555) 000-0000"
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Service Tier</label>
                    <div className="relative group">
                       <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                       <select 
                         value={formData.serviceLevel}
                         onChange={(e) => setFormData({...formData, serviceLevel: e.target.value})}
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                       >
                          <option>Standard</option>
                          <option>Premium</option>
                          <option>VIP Concierge</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Internal Notes</label>
                 <div className="relative group">
                    <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                    <textarea 
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Add specific client goals or background info here..."
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700 resize-none"
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 text-secondary-teal" />
                    Client will receive an invitation email
                 </div>
                 <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 md:px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] md:px-12 py-4 bg-primary-navy text-white rounded-2xl font-bold hover:bg-primary-navy-muted transition-all shadow-xl shadow-navy-900/10 disabled:opacity-50 active:scale-[0.98]"
                    >
                       {loading ? "Initializing..." : "Complete Intake"}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
