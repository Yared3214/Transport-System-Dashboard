import { ChevronRight } from "lucide-react";

export const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="font-bold text-sm">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="animate-in slide-in-from-left-2 duration-300" />}
    </button>
  );