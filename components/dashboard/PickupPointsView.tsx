import { ChevronLeft, ChevronRight, Edit2, MapPin, Search, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import usePickupPoints from "@/hooks/usePickupPoints";
import { usePickupPointsStore } from "@/store/usePickupPoints";

export const PickupPointsView = ({ onEdit, onDelete }: {  
  onEdit: (id: string) => void; 
  onDelete: Dispatch<SetStateAction<{
      id: string;
      name: string;
      type: "location" | "pickup" | "employee" | "driver" | "access-request";
  } | null>>}) => {

    const [search, setSearch] = useState("");
    const [officeFilter, setOfficeFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const { fetchData } = usePickupPoints();

    const pickupPoints = usePickupPointsStore((state) => state.pickupPoints);

    useEffect(() => {
      if (pickupPoints.length === 0) fetchData();
    },[fetchData, pickupPoints.length]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setCurrentPage(1); // Update synchronously here
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setOfficeFilter(e.target.value);
      setCurrentPage(1); // Update synchronously here
    };

    // 1. Get unique offices from the data for the dropdown
    const offices = useMemo(() => {
      const unique = Array.from(new Set(pickupPoints.map((p: any) => p.locations?.location_name).filter(Boolean)));
      return ["All", ...unique];
    }, [pickupPoints]);

    const filteredData = useMemo(() => {
      return pickupPoints.filter((pickup: any) => {
        const matchesSearch = pickup.name?.toLowerCase().includes(search.toLowerCase());
        const matchesOffice = officeFilter === "All" || pickup.locations?.location_name === officeFilter;
        return matchesSearch && matchesOffice;
      });
    }, [pickupPoints, search, officeFilter]);

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const activePage = Math.min(currentPage, totalPages || 1);
    const startIndex = (activePage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TOOLBAR: Stacks on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-[1.5rem] lg:rounded-[2rem] backdrop-blur-md">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search pickup points..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <select 
            value={officeFilter}
            onChange={handleFilterChange}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-4 py-2.5 focus:border-indigo-500/50 outline-none cursor-pointer"
          >
            {offices.map((off: any) => <option key={off} value={off}>{off}</option>)}
          </select>
        </div>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* MOBILE VIEW: Card List (Visible only on small screens) */}
        <div className="block md:hidden divide-y divide-slate-800/50">
          {paginatedData.length > 0 ? (
            paginatedData.map((point: any) => (
              <div key={point.id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{point.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{point.address}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                    point.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {point.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {point.employees ? point.employees.length : 0} Employees
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(point.id)} className="p-2 bg-slate-900 rounded-lg text-slate-400"><Edit2 size={14}/></button>
                    <button onClick={() => onDelete({id: point.id, name: point.name, type: 'pickup'})} className="p-2 bg-red-500/5 rounded-lg text-red-500/50"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">No Results</div>
          )}
        </div>

        {/* DESKTOP VIEW: Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name / Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Association</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {paginatedData.map((point: any) => (
                <tr key={point.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                        <MapPin size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none mb-1">{point.name}</p>
                        <p className="text-[10px] text-slate-500">{point.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-medium text-slate-400">
                      {point.employees ? point.employees.length : 0} Employees
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${point.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span className="text-[11px] font-bold text-slate-300">{point.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => onEdit(point.id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Edit2 size={16}/></button>
                      <button onClick={() => onDelete({id: point.id, name: point.name, type: 'pickup'})} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER: Improved for small screens */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-slate-900/30 border-t border-slate-800 flex flex-col items-center justify-between gap-6 md:flex-row md:px-8">
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest order-2 md:order-1">
              Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-white">{filteredData.length}</span>
            </p>

            <div className="flex items-center gap-2 order-1 md:order-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev: any) => prev - 1)}
                className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {/* Mobile: Only show current page indicator to save space */}
                <span className="md:hidden text-[10px] font-black text-white px-4">Page {currentPage} of {totalPages}</span>
                
                {/* Desktop: Show all page numbers */}
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === num 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev: any) => prev + 1)}
                className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
);
}