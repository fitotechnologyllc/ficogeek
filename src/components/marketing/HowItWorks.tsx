"use client";

import { FileSearch, Bot, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: FileSearch,
    title: "1. Get Your Credit Report",
    description: "Access your credit report from AnnualCreditReport.com and identify items to review.",
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100"
  },
  {
    icon: Bot,
    title: "2. Use FICO Geek AI",
    description: "Answer a few questions and generate structured dispute letters.",
    color: "bg-teal-50 text-teal-600",
    border: "border-teal-100"
  },
  {
    icon: HardDrive,
    title: "3. Download & Track",
    description: "Save, print, and organize everything in one secure place.",
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="container mx-auto px-6">
        {/* Trust Banner */}
        <div className="max-w-4xl mx-auto mb-32 p-8 rounded-3xl bg-slate-900 text-white text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent-teal/10 blur-[80px] group-hover:bg-accent-teal/20 transition-all duration-700" />
          <p className="text-xl lg:text-2xl font-serif italic text-slate-300 relative z-10">
            “No guarantees. No shortcuts. Just smarter tools to help you manage your credit.”
          </p>
        </div>

        <div className="space-y-20">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-accent-blue font-bold tracking-widest uppercase text-xs">The Process</h2>
            <h3 className="text-4xl font-bold font-outfit text-primary-navy">Simple, Structured, Sovereign.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {STEPS.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="space-y-8 text-center md:text-left">
                  <div className={`w-20 h-20 rounded-[2rem] ${step.color} border ${step.border} flex items-center justify-center mx-auto md:mx-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="w-10 h-10" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-bold font-outfit text-primary-navy">{step.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connector Arrow for Desktop */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[80%] w-[40%] h-px bg-gradient-to-r from-slate-200 to-transparent z-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
