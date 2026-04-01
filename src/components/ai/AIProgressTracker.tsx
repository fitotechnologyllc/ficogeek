"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface AIProgressTrackerProps {
  steps: Step[];
  currentStepIndex: number;
  completionPercentage: number;
}

export function AIProgressTracker({ steps, currentStepIndex, completionPercentage }: AIProgressTrackerProps) {
  return (
    <div className="w-full space-y-6 mb-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Intake Progress</span>
          <span className="text-sm font-bold text-primary-blue">{completionPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            className="h-full bg-gradient-to-r from-primary-blue to-secondary-teal shadow-[0_0_10px_rgba(59,130,246,0.3)]"
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                isCompleted 
                  ? "bg-primary-blue border-primary-blue text-white shadow-lg shadow-blue-500/20" 
                  : isActive
                    ? "bg-white border-primary-blue text-primary-blue shadow-lg shadow-blue-500/10 scale-110"
                    : "bg-white border-slate-200 text-slate-300"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                isActive ? "text-primary-navy" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
