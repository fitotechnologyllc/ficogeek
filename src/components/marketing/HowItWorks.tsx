import { Search, PenTool, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const STEPS = [
  {
    icon: Search,
    title: "Step 1: Isolation",
    subtitle: "Identify the Adversary",
    description: "Access your official reports from AnnualCreditReport.com. Use our Isolation Protocol to identify inaccuracies, duplications, and non-compliant records.",
    color: "bg-primary-blue/5 text-primary-blue",
    border: "border-primary-blue/10"
  },
  {
    icon: PenTool,
    title: "Step 2: Forge",
    subtitle: "Create the Evidence",
    description: "Initialize the Document Forge to generate institutional-grade dispute letters. Every template is mapped to specific FCRA and FDCPA legal citations.",
    color: "bg-secondary-teal/5 text-secondary-teal",
    border: "border-secondary-teal/10"
  },
  {
    icon: ShieldCheck,
    title: "Step 3: Vault",
    subtitle: "Master the Audit Trail",
    description: "Store your identification protocols and bureau responses in the encrypted Verification Vault. Maintain an airtight audit trail for potential litigation.",
    color: "bg-primary-navy/5 text-primary-navy",
    border: "border-primary-navy/10"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
       {/* Decorative Side Trace */}
       <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-slate-100 to-transparent ml-[10%]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Trust Banner */}
        <div className="max-w-5xl mx-auto mb-40 p-12 md:p-16 rounded-[3rem] bg-primary-navy text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 -mr-40 -mt-20 w-96 h-96 bg-secondary-teal/10 blur-[100px] group-hover:bg-secondary-teal/20 transition-all duration-1000" />
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
             <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-10 h-10 text-secondary-teal" />
             </div>
             <div className="text-center md:text-left space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary-teal/80 italic leading-none">The Sovereign Promise</p>
                <p className="text-xl lg:text-3xl font-extrabold font-outfit italic text-slate-100 leading-tight tracking-tight uppercase">
                  &quot;No generic shortcuts. Just institutional-grade tools for those who demand credit transparency.&quot;
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-navy/5 text-primary-navy text-[9px] font-bold uppercase tracking-[0.3em] italic"
            >
               THE PROTOCOL WORKFLOW
            </motion.div>
            <h3 className="text-5xl md:text-7xl font-extrabold font-outfit text-primary-navy tracking-tighter leading-none italic uppercase">Institutional Logic.</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg italic uppercase tracking-tight">The 3-Step Audit Protocol is designed for maximum clarity and verifiable results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative">
            {STEPS.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="relative group"
              >
                <div className="space-y-10 text-center md:text-left">
                  <div className={`w-24 h-24 rounded-[2.5rem] ${step.color} border-2 ${step.border} flex items-center justify-center mx-auto md:mx-0 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-700 bg-white`}>
                    <step.icon className="w-12 h-12 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                       <h4 className="text-3xl font-extrabold font-outfit text-primary-navy italic uppercase leading-none">{step.title}</h4>
                       <p className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest italic">{step.subtitle}</p>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed italic text-lg uppercase tracking-tighter">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Desktop Connector */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-12 left-[90%] w-[50%] h-[1px] bg-gradient-to-r from-slate-200 to-transparent z-0" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
             <Link 
               href="/signup" 
               className="group flex items-center gap-6 px-14 py-8 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-primary-blue transition-all active:scale-95 shadow-lg hover:shadow-3xl"
             >
                <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-primary-navy italic">Initialize Protocol</span>
                <div className="w-12 h-12 bg-primary-navy text-white rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                   <ArrowRight className="w-6 h-6" />
                </div>
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
