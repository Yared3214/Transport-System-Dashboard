"use client"
import { useEffect, useState } from "react";
import { Check, X, Mail, Calendar, UserCheck } from "lucide-react";
import { ActionStatusModal } from "./ActionStatusModal"; // Import the modal above
import useRequests from "@/hooks/useRequests";
import { useRequestsStore } from "@/store/useRequestsStore";

export default function AccessRequestsView({ onDeny }: any) {
  const [modal, setModal] = useState<{
    id: string;
    isOpen: boolean;
    status: 'loading' | 'success' | 'error';
    message: string;
  }>({
    id: '',
    isOpen: false,
    status: 'loading',
    message: ''
  });

  const { fetchData, approveRequest, error, loading } = useRequests();

  const requests = useRequestsStore((state) => state.requests);
  const removeRequest = useRequestsStore((state) => state.removeRequest);

  useEffect(() => {
    if(requests.length === 0) fetchData();
  },[fetchData, requests.length]);

  const handleApprove = async (id: string, email: string) => {
    setModal({ 
      id,
      isOpen: true, 
      status: 'loading', 
      message: `Provisioning security credentials for ${email}...` 
    });

      await approveRequest(id);
      setModal({ 
        id,
        isOpen: true, 
        status: 'success', 
        message: 'Account has been promoted to Admin. The user can now access the dashboard.' 
      });
  };

  if(error) {
    setModal({ 
      id: '',
      isOpen: true, 
      status: 'error', 
      message: 'Database synchronization failed. Please check system logs.' 
    });
  }
  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[2rem]">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mb-4">
          <UserCheck size={32} />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending requests</p>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
            <div className="flex items-center justify-center h-64 text-indigo-400">Loading...</div>
          ) : (
      <>
      <ActionStatusModal 
        isOpen={modal.isOpen}
        status={modal.status}
        message={modal.message}
        onClose={() => {
          if(modal.status === 'success') {
            removeRequest(modal.id);
          }
          setModal(prev => ({ ...prev, isOpen: false }))
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {requests.map((request: any) => (
          <div key={request.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] backdrop-blur-sm group hover:border-indigo-500/30 transition-all">
            {/* ... rest of your card UI ... */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm truncate max-w-[180px]">{request.email}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">
                    <Calendar size={10} />
                    <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter border border-amber-500/20">
                Pending
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleApprove(request.id, request.email)}
                className="flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <Check size={14} /> Grant Access
              </button>
              <button 
                onClick={() => onDeny({ id: request.id, name: request.email, type: 'access-request' })}
                className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <X size={14} /> Deny Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
          )}
    </div>
  );
}