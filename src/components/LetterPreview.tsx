"use client";

import React from "react";
import { ShieldCheck, FileText, Printer, Download, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getEntitlements } from "@/lib/entitlements";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LetterPreviewProps {
  content: string;
  recipient: string;
  address: string;
  date?: string;
  subject?: string;
  userName?: string;
  userAddress?: string;
  logo?: boolean;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  content,
  recipient,
  address,
  date,
  subject,
  userName,
  userAddress,
  logo = true,
}) => {
  const { profile } = useAuth();
  const router = useRouter();
  const entitlements = getEntitlements(profile);
  const canExportPDF = entitlements.canExportPDF;
  
  const [showPaywall, setShowPaywall] = useState(false);

  const handleRestrictedAction = (action: () => void) => {
    if (canExportPDF) {
      action();
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <div className="bg-slate-50 p-4 md:p-12 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative">
      {/* Paywall Modal overlay */}
      {showPaywall && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 print:hidden">
           <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold font-outfit text-primary-navy">Unlock Premium Exports</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                 You&apos;ve successfully drafted your letter using FICO Geek AI! To export as PDF, print, or save final drafts, please upgrade to a Premium plan.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                 <button 
                   onClick={() => router.push("/dashboard/billing")}
                   className="btn-primary w-full py-4 text-base"
                 >
                   View Upgrade Options
                 </button>
                 <button 
                   onClick={() => setShowPaywall(false)}
                   className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2"
                 >
                   Cancel
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Action Bar (Hidden in Print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-slate-500">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Document Preview</span>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => handleRestrictedAction(() => window.print())}
             className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
              {canExportPDF ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />} 
              Print Letter
           </button>
           <button 
             onClick={() => handleRestrictedAction(() => alert("PDF Download started... (Implement PDF generation)"))}
             className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
               canExportPDF ? "bg-primary-navy text-white hover:bg-primary-navy-muted" : "bg-slate-200 text-slate-500 cursor-not-allowed"
             }`}
           >
              {canExportPDF ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />} 
              Download PDF
           </button>
        </div>
      </div>

      {/* The Actual Letter (Paper Styling) */}
      <div id="printable-letter" className="bg-white mx-auto shadow-2xl p-8 md:p-16 min-h-[11in] w-full max-w-[8.5in] font-serif text-slate-900 border border-slate-100 print:shadow-none print:p-0 print:border-none">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-1">
             <p className="font-bold text-lg">{userName}</p>
             {userAddress && <p className="text-sm text-slate-600 whitespace-pre-line">{userAddress}</p>}
          </div>
          {logo && (
             <div className="flex items-center gap-1.5 opacity-40">
                <ShieldCheck className="w-8 h-8 text-primary-navy" />
                <span className="font-outfit text-sm font-bold tracking-tight text-primary-navy uppercase">FICO GEEK</span>
             </div>
          )}
        </div>

        {/* Date and Recipient */}
        <div className="space-y-6 mb-12">
           <p className="font-medium">{date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
           
           <div className="space-y-1">
              <p className="font-bold uppercase tracking-tight">{recipient}</p>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{address}</p>
           </div>
        </div>

        {/* Subject */}
        <div className="mb-8 p-4 bg-slate-50 border-l-4 border-primary-navy font-bold uppercase tracking-wide text-sm">
           RE: {subject}
        </div>

        {/* Body */}
        <div className="prose prose-slate max-w-none mb-16">
           <div className="whitespace-pre-line leading-loose text-justify italic font-serif text-[1.05rem]">
              {content || "Letter content will appear here..."}
           </div>
        </div>

        {/* Signature */}
        <div className="space-y-12">
           <p>Sincerely,</p>
           
           <div className="space-y-1">
              <div className="w-48 h-px bg-slate-300 mb-2" />
              <p className="font-bold text-lg">{userName}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Consumer</p>
           </div>
        </div>

        {/* Footer / Disclosure (Small print) */}
        <div className="mt-20 pt-8 border-t border-slate-100 text-[10px] text-slate-400 leading-normal">
           <p>This document was generated using FICO Geek self-help tools. The information contained herein is for educational purposes only. The user assumes all responsibility for the accuracy of claims and the results of this correspondence.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-letter, #printable-letter * {
            visibility: visible;
          }
          #printable-letter {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
           nav, .dashboard-sidebar, .dashboard-header {
             display: none !important;
           }
        }
      `}</style>
    </div>
  );
};
