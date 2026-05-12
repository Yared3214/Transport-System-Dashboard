"use client";

import React, { useState, useMemo, useEffect, use } from 'react';
import { 
  ArrowLeft, ChevronRight, Check, 
  MapPin, Save, Truck, Users, UserCheck, 
  ShieldCheck, 
  Loader2,
  Search
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const ManagePickupPage = ({ params: paramsPromise }: { params: Promise<{ id: string }> }) => {
  const params = use(paramsPromise); 
  const id = params.id;

  const router = useRouter();
  const isEdit = id !== 'new';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // State Management
  const [formData, setFormData] = useState<any>({
    name: '',
    location_id: '',
    driver_id: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [driverIds, setDriverIds] = useState<any[]>([]);

  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [passengerSearch, setPassengerSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Fetch Offices, Drivers, and Employees in parallel
      const [offRes, driRes, empRes, pickupRes] = await Promise.all([
        supabase.from('locations').select('id, location_name'),
        supabase.from('drivers').select('id, full_name, location_id'),
        supabase.from('employees').select('id, full_name, location_id, pickup_id'),
        supabase.from('pickup_points').select('driver_id')
      ]);

      if (driRes.data) setAllDrivers(driRes.data);
      if (empRes.data) setAllEmployees(empRes.data);
      if (offRes.data) setOffices(offRes.data);
      if (pickupRes.data) setDriverIds(pickupRes.data.map((p: any) => p.driver_id));
  
      if (isEdit) {
        // Fetch the specific pickup point data
        const { data: pickup } = await supabase
          .from('pickup_points')
          .select(`*, employees(id)`)
          .eq('id', id)
          .single();
  
        if (pickup) {
          setFormData({
            name: pickup.name,
            location_id: pickup.location_id,
            driver_id: pickup.driver_id,
          });
          setSelectedIds(pickup.employees.map((e: any) => e.id));
        }
      }
      
      // Set your lists in state here (assuming you have useState for them)
      setLoading(false);
    };
  
    loadData();
  }, [id, isEdit]);

  const handleFinalize = async () => {
    setSaving(true);
    
    // 1. Save the Pickup Point
    const { data: pickup, error: pError } = await supabase
      .from('pickup_points')
      .upsert({
        ...(isEdit ? { id: id } : {}),
        name: formData.name,
        location_id: formData.location_id,
        driver_id: formData.driver_id
      })
      .select()
      .single();
  
    if (pError) {
      console.error(pError);
      setSaving(false);
      return;
    }
  
    // 2. Clear old assignments for this pickup
    // (Prevents ghost assignments if you removed an employee from the list)
    await supabase
      .from('employees')
      .update({ pickup_id: null })
      .eq('pickup_id', pickup.id);
  
    // 3. Assign currently selected employees
    if (selectedIds.length > 0) {
      const { error: eError } = await supabase
        .from('employees')
        .update({ pickup_id: pickup.id })
        .in('id', selectedIds);
        
      if (eError) console.error(eError);
    }
  
    setSaving(false);
    router.push('/'); // Navigate back to dashboard
  };

  const handleDiscard = () => {
    const isDirty = formData.name || formData.location_id || formData.driver_id || selectedIds.length > 0;
    
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      router.push('/');
    }
  };
  
  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    router.push('/');
  };

  // Filtering Logic
  const filteredDrivers = useMemo(() => {
    return allDrivers
      .filter(d => d.location_id === formData.location_id)
      .filter(d => d.full_name.toLowerCase().includes(driverSearch.toLowerCase()));
  }, [formData.location_id, allDrivers, driverSearch]);
  
  const filteredEmployees = useMemo(() => {
    return allEmployees
      .filter(e => e.location_id === formData.location_id)
      .filter(e => 
        e.full_name.toLowerCase().includes(passengerSearch.toLowerCase()) ||
        e.role?.toLowerCase().includes(passengerSearch.toLowerCase())
      );
  }, [formData.location_id, allEmployees, passengerSearch]);

  const selectedStaffData = allEmployees.filter(e => selectedIds.includes(e.id));

  const toggleEmployee = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#060608] text-indigo-500 text-xl font-black animate-pulse uppercase">Initializing Core...</div>

  return (
    <div className="min-h-screen bg-[#060608] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* NAVIGATION: Optimized for mobile (condensed padding) */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#060608]/80 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 md:gap-6 w-full sm:w-auto">
          <button 
            onClick={() => router.back()}
            className="p-2.5 md:p-3 hover:bg-slate-800 rounded-2xl text-slate-400 border border-transparent hover:border-slate-700 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base md:text-xl font-black tracking-tight text-white uppercase truncate">
              {isEdit ? 'Configure Route' : 'Establish New Route'}
            </h1>
            <div className="hidden xs:flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              <span className="text-indigo-400">LogiCore</span>
              <ChevronRight size={10} />
              <span>Route Intel</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
          onClick={handleDiscard}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-slate-400 font-bold text-[10px] rounded-xl transition-all uppercase tracking-widest">
            Discard
          </button>
          <button 
            onClick={handleFinalize} 
            disabled={saving || !formData.name || !formData.location_id}
            className="flex-[2] sm:flex-none px-6 py-2.5 bg-indigo-600 disabled:bg-slate-800 text-white font-bold text-[10px] rounded-xl shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="whitespace-nowrap">{saving ? 'Saving...' : 'Finalize'}</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT: 12-column grid collapses to 1-column on mobile */}
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 grid grid-cols-12 gap-6 md:gap-8">
        
        {/* RIGHT COLUMN (Preview) - On Mobile, we show this first as a "Summary Card" */}
        <div className="col-span-12 lg:col-span-5 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full -mr-24 -mt-24" />
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6 md:mb-10">
                  <div>
                    <span className="bg-indigo-600/10 text-indigo-400 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Live Summary</span>
                    <h3 className="text-xl md:text-3xl font-black text-white mt-3 tracking-tighter">
                      {formData.name || 'Untitled Route'}
                    </h3>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
                    <UserCheck size={24} />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Route Visualizer */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-slate-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Pickup</p>
                        <p className="text-sm md:text-base font-bold text-white truncate">{formData.name || 'Set Pickup Point...'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Hub</p>
                        <p className="text-sm md:text-base font-bold text-slate-400 truncate">
                          {offices.find((o:any) => o.id === formData.location_id)?.location_name || 'Await Destination...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/60 hidden md:block">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex justify-between">
                      <span>Assigned Manifest</span>
                      <span className="text-indigo-400">{selectedIds.length} Personnel</span>
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedStaffData.length > 0 ? (
                        selectedStaffData.map((s:any) => (
                          <div key={s.id} className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/40">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                              {s.full_name.charAt(0)}
                            </div>
                            <p className="text-xs font-bold text-white truncate">{s.full_name}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-600 italic py-4 text-center">No personnel added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-5 items-center gap-4">
              <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
              <p className="text-[11px] font-medium text-emerald-500/80 leading-relaxed">
                Manifest compliance validated. All personnel associated with target hub.
              </p>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN (Form Config) */}
        <div className="col-span-12 lg:col-span-7 space-y-6 md:order-1">
          
          {/* Section 1: Core Identity */}
          <section className="bg-slate-900/20 border border-slate-800/60 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <MapPin size={20} />
              </div>
              <h2 className="text-base md:text-lg font-bold text-white">Route Fundamentals</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pickup Point</label>
                <input 
                  type="text"
                  value={formData.name || ''}
                  placeholder="e.g. Sarbet Junction"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 text-sm text-white"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Destination Hub</label>
                <div className="relative">
                  <select 
                    value={formData.location_id || ''}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-indigo-500/20"
                    onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                  >
                    <option value="">Select an office</option>
                    {offices.map((o:any) => <option key={o.id} value={o.id}>{o.location_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Driver Assignment */}
          <section className={`transition-all duration-500 ${formData.location_id ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="bg-slate-900/20 border border-slate-800/60 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Logistics Personnel</h2>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Assign Operator</p>
                  </div>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Filter drivers..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500/20 w-full sm:w-56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredDrivers.map((driver:any) => {
                  const isActive = formData.driver_id === driver.id;
                  const isBusy = driverIds.includes(driver.id);
                  return (
                    <div 
                      key={driver.id}
                      onClick={() => !isBusy && setFormData({...formData, driver_id: driver.id})}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        isActive ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10' : 
                        isBusy ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed' : 
                        'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {driver.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{driver.full_name}</p>
                        <p className="text-[9px] uppercase tracking-tighter text-slate-500">Operator</p>
                      </div>
                      {isActive && <Check size={16} className="text-blue-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Passenger Manifest */}
          <section className={`transition-all duration-500 ${formData.location_id ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="bg-slate-900/20 border border-slate-800/60 rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Passenger Manifest</h2>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Select Staff ({selectedIds.length})</p>
                  </div>
                </div>

                <div className="relative flex-1 lg:max-w-xs">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search name..."
                    value={passengerSearch}
                    onChange={(e) => setPassengerSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredEmployees.map((emp:any) => {
                  const isActive = selectedIds.includes(emp.id);
                  const isBusy = emp.pickup_id && emp.pickup_id !== params.id;
                  return (
                    <div 
                      key={emp.id}
                      onClick={() => !isBusy && toggleEmployee(emp.id)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isActive ? 'bg-indigo-600 border-indigo-400' : 
                        isBusy ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed' : 
                        'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-white truncate pr-4">{emp.full_name}</p>
                      <p className={`text-[9px] mt-1 font-bold uppercase tracking-tight ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {emp.role || 'Staff'}
                      </p>
                      {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* DISCARD CONFIRMATION MODAL */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-md" onClick={() => setShowDiscardConfirm(false)} />
    
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl shadow-red-500/10">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <ArrowLeft size={28} />
            </div>
      
            <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Abort Configuration?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              You are about to discard all unsaved route intel. This action is irreversible and the manifest data will be purged from the current session.
            </p>
      
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-2xl transition-all uppercase tracking-widest"
              >
                Resume Work
              </button>
              <button 
                onClick={confirmDiscard}
                className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-2xl shadow-lg shadow-red-600/20 transition-all uppercase tracking-widest"
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePickupPage;