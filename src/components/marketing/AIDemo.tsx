"use client";

import { Bot, User, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const CHAT_STEPS = [
  {
    role: "assistant",
    message: "Hi! I'm Geek. Let's start your dispute letter. Which credit bureau are we contacting today?",
    delay: 0.5
  },
  {
    role: "user",
    message: "I need to dispute an item with Experian.",
    delay: 2.0
  },
  {
    role: "assistant",
    message: "Got it. Experian. What is the reason for the dispute? (e.g. Identity Theft, Incorrect Balance, Not My Account)",
    delay: 3.5
  }
];

export const AIDemo = () => {
  return (
    <section id="ai-demo" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} className="text-accent-blue" />
              Revolutionary AI Assistance
            </div>
            <h3 className="text-5xl lg:text-6xl font-bold font-outfit text-primary-navy leading-tight">
              Your letter, <br /><span className="text-accent-blue">generated in minutes.</span>
            </h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
               Skip the templates and legal jargon. Our AI Assistant, Geek, guides you through every step of the process.
            </p>
            
            <ul className="space-y-6 pt-4">
              {[
                "Context-aware dispute logic",
                "Professional legal formatting",
                "Secure data encryption",
                "Real-time tracking of letters"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-primary-navy font-bold">
                  <CheckCircle2 className="text-accent-teal w-6 h-6" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Chat Mock UI */}
            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-3xl border border-slate-100 shadow-3xl overflow-hidden max-w-md mx-auto relative z-10"
            >
              <div className="bg-primary-navy p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-outfit">Geek AI</h4>
                    <div className="flex items-center gap-1.5 leading-none">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[400px] p-6 space-y-6 overflow-y-auto bg-slate-50/50">
                {CHAT_STEPS.map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     whileInView={{ opacity: 1, y: 0, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: step.delay }}
                     className={`flex items-end gap-3 ${step.role === "user" ? "flex-row-reverse" : ""}`}
                   >
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.role === "assistant" ? "bg-primary-navy text-white" : "bg-accent-blue text-white"}`}>
                        {step.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                     </div>
                     <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed max-w-[80%] ${step.role === "assistant" ? "bg-white text-slate-700 shadow-sm border border-slate-100" : "bg-accent-blue text-white shadow-xl shadow-accent-blue/10"}`}>
                        {step.message}
                     </div>
                   </motion.div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <Sparkles size={16} />
                   </div>
                   <input 
                      disabled
                      placeholder="Ask Geek anything..."
                      className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
                   />
                   <div className="absolute inset-y-0 right-2 flex items-center">
                      <button className="w-9 h-9 bg-primary-navy text-white rounded-lg flex items-center justify-center hover:bg-primary-navy-muted transition-colors">
                        <Send size={16} />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Background for Demo */}
            <div className="absolute -inset-10 bg-accent-blue/5 rounded-[4rem] blur-[80px] -z-10 group-hover:bg-accent-blue/10 transition-colors" />
          </div>
        </div>
      </div>
    </section>
  );
};
