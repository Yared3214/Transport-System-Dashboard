"use client"
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

interface ActionStatusModalProps {
  isOpen: boolean;
  status: 'loading' | 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function ActionStatusModal({ isOpen, status, message, onClose }: ActionStatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={status !== 'loading' ? onClose : undefined} />
      
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-center shadow-2xl">
        {status !== 'loading' && (
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center">
          {status === 'loading' && (
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-6">
              <Loader2 size={40} className="animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
          )}

          {status === 'error' && (
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
              <AlertCircle size={40} />
            </div>
          )}

          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
            {status === 'loading' ? 'Authorizing' : status === 'success' ? 'Access Granted' : 'Action Failed'}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {message}
          </p>

          {status !== 'loading' && (
            <button
              onClick={onClose}
              className={`mt-8 w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all ${
                status === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
              } text-white`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}