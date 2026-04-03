"use client";

import { usePathname } from "next/navigation";
import { 
  FileSearch, 
  ClipboardCheck, 
  Zap, 
  FileText, 
  UploadCloud, 
  Activity,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const WORKFLOW_STEPS = [
  { 
    id: 1, 
    label: "Get Reports", 
    icon: FileSearch, 
    path: "/dashboard",
    description: "Official Data"
  },
  { 
    id: 2, 
    label: "Review Reports", 
    icon: ClipboardCheck, 
    path: "/dashboard/disputes",
    description: "Analyze Errors"
  },
  { 
    id: 3, 
    label: "Start Dispute", 
    icon: Zap, 
    path: "/dashboard/ai",
    description: "Geek Guidance"
  },
  { 
    id: 4, 
    label: "Generate Letter", 
    icon: FileText, 
    path: "/dashboard/letters",
    description: "Letter Forge"
  },
  { 
    id: 5, 
    label: "Upload Docs", 
    icon: UploadCloud, 
    path: "/dashboard/vault",
    description: "Evidence Stack"
  },
  { 
    id: 6, 
    label: "Track Progress", 
    icon: Activity, 
    path: "/dashboard",
    description: "Mission Control"
  },
];

export function WorkflowBar() {
  const pathname = usePathname();

  // Determine current step based on path
  const getCurrentStep = () => {
    if (pathname === "/dashboard/disputes") return 2;
    if (pathname === "/dashboard/ai") return 3;
    if (pathname === "/dashboard/disputes/new") return 3;
    if (pathname === "/dashboard/letters") return 4;
    if (pathname === "/dashboard/vault") return 5;
    // Default to 1 (Get Reports) or 6 (Track) based on some logic? 
    // For now, if on dashboard, we'll show 1 unless we add a specific check.
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="w-full bg-white border-b border-slate-100 shadow-sm sticky top-[72px] z-40 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between min-w-[800px]">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center group">
                <Link 
                  href={step.path}
                  className={`flex items-center gap-3 transition-all ${
                    isActive ? "opacity-100 scale-105" : "opacity-40 hover:opacity-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                    isActive 
                      ? "bg-primary-navy text-white shadow-lg" 
                      : isCompleted 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none italic ${
                      isActive ? "text-primary-navy" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] font-medium text-slate-300 italic uppercase tracking-tighter">
                      {step.description}
                    </span>
                  </div>
                </Link>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className="mx-6 text-slate-100">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
