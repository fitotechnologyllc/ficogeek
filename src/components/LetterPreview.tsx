"use client";

import React from "react";
import { ShieldCheck, FileText, Printer, Download, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getEntitlements } from "@/lib/entitlements";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { useSubscription } from "@/context/SubscriptionContext";
import { logAnalyticsEvent } from "@/lib/analytics";
import { useEffect } from "react";

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
  const { profile, user } = useAuth();
  const { plan } = useSubscription();
  const router = useRouter();
  const entitlements = getEntitlements(profile);
  const canExportPDF = entitlements.canExportPDF;
  
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      logAnalyticsEvent(user.uid, "letter_preview_view", { recipient });
    }
  }, [user, recipient]);

  const handleRestrictedAction = (actionName: string, action: () => void) => {
    if (user) {
      logAnalyticsEvent(user.uid, "letter_export_click", { action: actionName, allowed: canExportPDF });
    }
    if (canExportPDF) {
      action();
    } else {
      if (user) logAnalyticsEvent(user.uid, "paywall_view", { trigger: actionName });
      setIsUpgradeModalOpen(true);
    }
  };

  return (
    <div className="bg-slate-50 p-4 md:p-12 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative">
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />

      {/* Action Bar (Hidden in Print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-slate-500">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Document Preview</span>
        </div>
        <div className="flex gap-4">
            <button 
              onClick={() => handleRestrictedAction("print", () => window.print())}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
               {canExportPDF ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />} 
               Print Letter
            </button>
            <button 
              onClick={() => handleRestrictedAction("pdf", () => window.print())}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                canExportPDF ? "bg-primary-navy text-white hover:bg-primary-navy-muted" : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
               {canExportPDF ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />} 
               Export to PDF
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
