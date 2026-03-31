"use client";

import React from "react";
import { ShieldCheck, FileText, Printer, Download } from "lucide-react";

interface LetterPreviewProps {
  content: string;
  recipient: string;
  address: string;
  date: string;
  subject: string;
  userName: string;
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
  return (
    <div className="bg-slate-50 p-4 md:p-12 rounded-3xl border border-slate-200 shadow-inner overflow-hidden">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-slate-500">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Document Preview</span>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => window.print()}
             className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
              <Printer className="w-4 h-4" /> Print Letter
           </button>
           <button className="px-6 py-2.5 bg-primary-navy text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-navy-muted transition-all shadow-lg">
              <Download className="w-4 h-4" /> Download PDF
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
