"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Users, Truck, MapPin, Building2, Plus, 
  Search,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { OfficeLocationsView } from '@/components/dashboard/OfficeLocations';
import { EmployeesView } from '@/components/dashboard/EmployeesView';
import { DriversView } from '@/components/dashboard/DriversView';
import { SidebarItem } from '@/components/dashboard/SidebarItem';
import { SmartFormModal } from '@/components/dashboard/SmartFormModal';
import { supabase } from '@/lib/supabase/client';
import useData from '@/hooks/useData';
import { DeleteConfirmModal } from '@/components/dashboard/SmartDeleteModal';
import { useRouter } from 'next/navigation';
import { PickupPointsView } from '@/components/dashboard/PickupPointsView';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import AccessRequestsView from '@/components/dashboard/AccessRequestsView';

const tableMap = {
  location: 'locations',
  pickup: 'pickup_points',
  employee: 'employees',
  driver: 'drivers',
  'access-request': 'profiles', // Assuming access requests are stored in the profiles table
};

const AdminLogisticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('pickup-points');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Modal State Management ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'location' | 'pickup' | 'employee' | 'driver';
    data?: any;
  }>({
    isOpen: false,
    type: 'location',
  });

  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/pickup/new');
  };
  
  // Navigate to EDIT an existing pickup
  const handleEdit = (id: string) => {
    router.push(`/pickup/${id}`);
  };

  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string, type: 'location' | 'pickup' | 'employee' | 'driver' | 'access-request'; } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { fetchData, fetchOfficeLocations, fetchProfile, loading, data, offices, user } = useData(activeTab);

  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

  useEffect(() => {
    fetchOfficeLocations();
  }, [fetchOfficeLocations]);


  // --- 2. CREATE / UPDATE ---
  const handleSave = async (formData: any) => {

    const table = tableMap[modalConfig.type];
    const isEdit = !!modalConfig.data?.id;

    let error;
    if (isEdit) {
      const { error: err } = await supabase.from(table).update(formData).eq('id', modalConfig.data.id);
      error = err;
    } else {
      const { error: err } = await supabase.from(table).insert([formData]);
      error = err;
    }

    if (!error) {
      closeModal();
      fetchData();
    } else {
      alert(error.message);
    }
  };

  // --- 3. DELETE ---
  const handleDeleteAction = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
  
    // Determine table based on activeTab
    const table = tableMap[deleteTarget.type];
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', deleteTarget.id);
  
    if (!error) {
      setDeleteTarget(null); // Close modal
      fetchData(); // Refresh list
    }
    setIsDeleting(false);
  };

  const handleApproveAccessRequest = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, role: 'admin' }) // Or 'driver' based on your choice
      .eq('id', id);

    if (error) {
      alert("Error approving access request: " + error.message);
    } else {
      // Trigger a re-fetch of your data to update the UI
      await fetchData();
      alert("Access request approved successfully!");
    }
  }

  const supabaseBrowser = getSupabaseBrowserClient();
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    return user?.id || '';
  },[supabaseBrowser.auth]);

  useEffect(() => {
    const initializeProfile = async () => {
      const userId = await getUserId();
      if (userId) {
        await fetchProfile(userId);
      }
    };

    initializeProfile();
  }, [fetchProfile, getUserId]);
  

  const handleSignout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/auth');
  }

  const openModal = (type: any, data: any = null) => {
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // Maps the tab key to the modal type for the "Create New" button
  const getModalTypeFromTab = () => {
    if (activeTab === 'locations') return 'location';
    if (activeTab === 'pickup-points') return 'pickup';
    if (activeTab === 'employees') return 'employee';
    if (activeTab === 'drivers') return 'driver';
    return 'location';
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-200 font-sans antialiased overflow-hidden">

      {/* 1. DELETE MODAL */}
      <DeleteConfirmModal 
      isOpen={!!deleteTarget}
      itemName={deleteTarget?.name}
      loading={isDeleting}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteAction}
    />

      {/* Smart Modal Integration */}
      <SmartFormModal 
        key={`${modalConfig.type}-${modalConfig.isOpen}-${modalConfig.data?.id || 'new'}`}
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        initialData={modalConfig.data}
        offices={offices}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* 1. MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR - Hidden on mobile, Slide-in drawer on trigger */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6 
        transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Truck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">LogiCore</h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Admin Portal</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
            {[
              ...(user.role === 'super-admin'
                ? [{ id: 'locations', label: 'Office Locations', icon: <Building2 size={18}/> }]
                : []),
            { id: 'pickup-points', label: 'Pickup Points', icon: <MapPin size={18}/> },
            { id: 'employees', label: 'Employees', icon: <Users size={18}/> },
            { id: 'drivers', label: 'Drivers', icon: <Truck size={18}/> },
            ...(user.role === 'super-admin' 
              ? [{ id: 'access-requests', label: 'Access Requests', icon: <ShieldCheck size={18}/> }] 
              : []),
            ].map((item) => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false); // Close on mobile after selection
              }} 
            />
            ))}
        </nav>

        {/* --- BOTTOM SECTION (System Info & Auth) --- */}
        <div className="mt-auto space-y-4">
          {/* 1. SYSTEM STATUS CARD */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] mb-2">Security Level</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span>Encrypted</span>
              </div>
              <span className="text-[9px] text-slate-600 font-mono">v4.2.0</span>
            </div>
          </div>

          {/* 2. LOGOUT BUTTON */}
          <button 
            onClick={handleSignout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER - Responsive */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center gap-4 w-full max-w-xs">
              <Search size={18} className="text-slate-500" />
              <input 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  {/* User Email - Displayed subtly */}
                  <p className="text-[11px] font-medium text-slate-400 lowercase tracking-tight">
                    {user.email}
                  </p>
                  <p className="text-xs font-black text-white leading-none uppercase">
                    {user.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
      
                {/* System Status / Role Label */}
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                  <p className="text-[9px] text-indigo-400/80 uppercase font-black tracking-[0.2em]">
                    Verified Identity
                  </p>
                </div>
              </div>
    
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-800 shadow-lg group-hover:shadow-indigo-500/20 transition-all" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Online" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* TITLE SECTION - Stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 lg:hidden mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                <ChevronRight size={10} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{activeTab}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-slate-400 text-xs lg:text-sm mt-1">Manage system-wide records</p>
            </div>
            
            {activeTab !== 'access-requests' && (
              <button 
                onClick={() => {
                  if(activeTab === 'pickup-points') handleCreateNew();
                  else openModal(getModalTypeFromTab());              
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10 transition-all active:scale-95"
              >
                <Plus size={18} /> Create New
              </button>
)}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-indigo-400">Loading...</div>
          ) : (
            <div className="min-w-full inline-block align-middle">
               {/* Content Views - Ensure they are wrapped in overflow-x-auto internally */}
               {activeTab === 'pickup-points' && <PickupPointsView data={data} onEdit={handleEdit} onDelete={setDeleteTarget}/>}
               {activeTab === 'locations' && <OfficeLocationsView data={data} onEdit={(d) => openModal('location', d)} onDelete={setDeleteTarget}/>}
               {activeTab === 'employees' && <EmployeesView data={data} onEdit={(d) => openModal('employee', d)} onDelete={setDeleteTarget}/>}
               {activeTab === 'drivers' && <DriversView data={data} onEdit={(d) => openModal('driver', d)} onDelete={setDeleteTarget}/>}
               {activeTab === 'access-requests' && (<AccessRequestsView data={data} onApprove={handleApproveAccessRequest} onDeny={setDeleteTarget}/>)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLogisticsDashboard;