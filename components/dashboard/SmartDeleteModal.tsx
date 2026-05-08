import { Trash2 } from "lucide-react";

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, loading }: any) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Heavy Backdrop for Danger actions */}
        <div 
          className="absolute inset-0 bg-[#060608]/90 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={onClose} 
        />
        
        {/* Modal Card */}
        <div className="relative w-full max-w-sm bg-slate-950 border border-red-500/20 rounded-[2.5rem] shadow-2xl shadow-red-500/10 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 text-center">
            {/* Pulsing Danger Icon */}
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20 shadow-inner">
              <Trash2 size={38} className="animate-pulse" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Wait a second!</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You are about to permanently remove <br/>
              <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                {itemName || "this record"}
              </span>
            </p>
            <p className="text-[10px] text-slate-600 uppercase font-bold mt-4 tracking-widest">
              This action cannot be undone
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs transition-all active:scale-95"
            >
              Go Back
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Yes, Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };