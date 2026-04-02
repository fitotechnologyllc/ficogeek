"use client";

import { Bot, FileCheck, ShieldCheck, Briefcase, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  {
    title: "AI Dispute Assistant",
    description: "Guided letter creation powered by AI. Answer simple questions and let Geek do the heavy lifting.",
    icon: Bot,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10"
  },
  {
    title: "Letter Generator",
    description: "Professional, print-ready documents that follow industry standards for credit correspondence.",
    icon: FileCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    title: "Secure Document Vault",
    description: "Encrypted storage for your records. Keep track of all incoming and outgoing letters effortlessly.",
    icon: ShieldCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Pro Tools",
    description: "Client management and bulk workflows. Designed for credit professionals and agency owners.",
    icon: Briefcase,
    color: "text-amber-600",
    bg: "bg-amber-50"
  }
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-20">
           <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-xs">Capabilities</h2>
           <h3 className="text-4xl font-bold font-outfit text-primary-navy">Engineered for Results.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="premium-card p-10 group hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold font-outfit text-primary-navy">{feature.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed leading-7">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-50 mt-8">
                 <Link href="/signup" className="flex items-center gap-2 text-sm font-bold text-primary-navy hover:text-accent-blue transition-colors group/link">
                   Explore {feature.title} <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                 </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
