"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle,
  CloudUpload,
  Calendar,
  User,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const STEPS = [
  "Select Bureau",
  "Dispute Type",
  "Account Details",
  "Reasoning",
  "Notes",
  "Attachments",
  "Review",
  "Finalize"
];

const BUREAUS = [
  { id: "equifax", name: "Equifax", icon: Building2 },
  { id: "experian", name: "Experian", icon: Building2 },
  { id: "transunion", name: "TransUnion", icon: Building2 },
  { id: "all", name: "All Three Bureaus", icon: ShieldCheck },
];

const DISPUTE_TYPES = [
  { id: "inaccurate", name: "Inaccurate Information", desc: "Balance, date, or status is wrong." },
  { id: "not-mine", name: "Account Not Mine", desc: "Identity theft or clerical error." },
  { id: "duplicate", name: "Duplicate Account", desc: "Same account listed multiple times." },
  { id: "obsolete", name: "Obsolete Information", desc: "Negative item should have aged off." },
  { id: "verification", name: "Verification Request", desc: "Requesting creditor to prove debt." },
];

export default function DisputeWizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bureau: "",
    type: "",
    accountName: "",
    accountNumber: "",
    reason: "",
    notes: "",
    attachments: [],
  });
  const { user, profile } = useAuth();
  const router = useRouter();

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    try {
      await addDoc(collection(db, "disputes"), {
        ...formData,
        ownerUID: user?.uid,
        status: "Draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      router.push("/dashboard/disputes");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-20 z-10">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold">
               {step}
            </div>
            <div>
               <h2 className="font-bold text-slate-800 leading-none mb-1">{STEPS[step - 1]}</h2>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Step {step} of {STEPS.length}</p>
            </div>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
               <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= step ? "bg-primary-blue w-6" : "bg-slate-200"}`} />
            ))}
         </div>
      </div>

      <div className="premium-card p-10 min-h-[500px] flex flex-col">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit text-primary-navy">Which bureau are you disputing with?</h3>
                <p className="text-slate-500 font-medium">Select the credit reporting agency that is displaying the inaccurate data.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUREAUS.map((b) => (
                   <button
                    key={b.id}
                    onClick={() => setFormData({...formData, bureau: b.id})}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                      formData.bureau === b.id 
                        ? "border-primary-blue bg-primary-blue/5 shadow-lg shadow-primary-blue/10" 
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                    }`}
                   >
                      <div className={`p-3 rounded-xl ${formData.bureau === b.id ? "bg-primary-blue text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
                         <b.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800">{b.name}</span>
                   </button>
                ))}
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit text-primary-navy">What is the type of dispute?</h3>
                <p className="text-slate-500 font-medium tracking-tight">Categorizing your dispute helps generate the most effective letter template.</p>
             </div>
             <div className="space-y-3">
                {DISPUTE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({...formData, type: t.id})}
                    className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                      formData.type === t.id 
                        ? "border-secondary-teal bg-secondary-teal/5 shadow-lg" 
                        : "border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <HelpCircle className={`w-6 h-6 ${formData.type === t.id ? "text-secondary-teal" : "text-slate-300"}`} />
                       <div>
                          <p className="font-bold text-slate-800">{t.name}</p>
                          <p className="text-xs font-medium text-slate-400">{t.desc}</p>
                       </div>
                    </div>
                    {formData.type === t.id && <CheckCircle2 className="w-6 h-6 text-secondary-teal" />}
                  </button>
                ))}
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit text-primary-navy">Account Information</h3>
                <p className="text-slate-500 font-medium tracking-tight">Enter the details exactly as they appear on your credit report.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Creditor Name
                   </label>
                   <input 
                    type="text" 
                    placeholder="e.g. Chase Bank"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-medium"
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Account Number (Partial)
                   </label>
                   <input 
                    type="text" 
                    placeholder="e.g. XXXX-1234"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-medium"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                   />
                </div>
             </div>
             <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">IMPORTANT: Never provide your full credit card or social security number here unless required by the specific template flow. FICO Geek recommends masking sensitive data.</p>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit text-primary-navy">Legal Reasoning</h3>
                <p className="text-slate-500 font-medium tracking-tight">Clearly explain why this information should be corrected or removed.</p>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Reason for Dispute</label>
                <textarea 
                  rows={6}
                  placeholder="Describe the discrepancy in detail..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-medium text-slate-700"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                ></textarea>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest transition-all">Use Template Reasoning</button>
                <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest transition-all">Attach Official Snippet</button>
             </div>
          </div>
        )}

        <div className="mt-auto pt-10 flex justify-between items-center border-t border-slate-100">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${
              step === 1 ? "opacity-0 cursor-default" : "text-slate-400 hover:text-primary-navy hover:bg-slate-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> Previous Step
          </button>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 text-slate-400 font-bold hover:text-primary-navy transition-all">Save Draft</button>
            {step < STEPS.length ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex items-center gap-2 group"
              >
                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="btn-primary flex items-center gap-2 bg-gradient-to-r from-secondary-teal to-primary-blue"
              >
                Generate Final Letter <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
