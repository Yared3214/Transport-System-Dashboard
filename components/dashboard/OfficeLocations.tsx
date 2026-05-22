import useOffices from "@/hooks/useOffices";
import { useOfficesStore } from "@/store/useOfficesStore";
import { Building2, Edit2, Trash2, Truck, Users } from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";

export const OfficeLocationsView = ({ onEdit, onDelete }: { 
  onEdit: (data: any) => void;
  onDelete: Dispatch<SetStateAction<{
    id: string;
    name: string;
    type: "location" | "pickup" | "employee" | "driver" | "access-request";
} | null>> }) => {

  const { fetchOffices, error, loading } = useOffices();

  const offices = useOfficesStore((state) => state.offices);

  useEffect(() => {
    fetchOffices();
  },[fetchOffices]);
  
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-indigo-400">Loading...</div>
          ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {offices.map((office: any, i: number) => (
      <div 
        key={i} 
        className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 md:p-6 hover:border-indigo-500/40 transition-all group relative overflow-hidden flex flex-col justify-between"
      >
        {/* ACTIONS: Visible on hover for desktop, always visible on mobile */}
        <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex gap-2">
          <button 
            onClick={() => onEdit(office)} 
            className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 transition-colors"
            aria-label="Edit Office"
          >
            <Edit2 size={16}/>
          </button>
          <button 
            onClick={() => onDelete({ id: office.id, name: office.location_name, type: 'location'})} 
            className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/20 transition-all"
            aria-label="Delete Office"
          >
            <Trash2 size={16}/>
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex items-center gap-4 mb-6 pr-20 md:pr-0"> 
          {/* Added padding-right to mobile to prevent text overlapping buttons */}
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Building2 size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base md:text-lg text-white truncate">
              {office.location_name}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[180px] md:max-w-full">
              {office.address || 'No address specified'}
            </p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 border-t border-slate-800/60 pt-5 md:pt-6">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Staff</p>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Users size={14} className="text-indigo-400" />
              </div>
              <span className="text-sm font-bold text-slate-200">89</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Active Routes</p>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Truck size={14} className="text-indigo-400" />
              </div>
              <span className="text-sm font-bold text-slate-200">
                {office.pickup_points ? office.pickup_points[0].count : 0}
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE DECORATION: A subtle progress-style bar at the bottom */}
        <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/20 w-full md:hidden" />
      </div>
    ))}
  </div>
          )}
    </div>
);}