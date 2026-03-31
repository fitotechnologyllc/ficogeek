"use client";

import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  History, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  AlertCircle 
} from "lucide-react";

interface DisputeEvent {
  id: string;
  type: string;
  summary: string;
  timestamp: any;
  actorUID?: string;
}

interface DisputeTimelineProps {
  events: DisputeEvent[];
  loading?: boolean;
}

export const DisputeTimeline: React.FC<DisputeTimelineProps> = ({ events, loading }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "STATUS_CHANGE": return <RefreshCw className="w-4 h-4" />;
      case "LETTER_GENERATED": return <FileText className="w-4 h-4" />;
      case "NOTE_ADDED": return <MessageSquare className="w-4 h-4" />;
      case "SENT": return <Send className="w-4 h-4" />;
      case "RESOLVED": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "---";
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-48 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Timeline Line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-6 pb-8 group last:pb-0">
          {/* Icon Node */}
          <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
            index === 0 ? "bg-primary-navy text-white scale-110 shadow-navy-900/20" : "bg-slate-100 text-slate-400 group-hover:bg-primary-blue group-hover:text-white"
          }`}>
            {getEventIcon(event.type)}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="flex justify-between items-start gap-4">
               <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-primary-blue transition-colors">
                 {event.summary}
               </p>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                 {formatDate(event.timestamp)}
               </span>
            </div>
            {event.actorUID && (
               <p className="text-[10px] font-bold text-primary-blue uppercase tracking-widest mt-1 opacity-60">Verified Actor Action</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
