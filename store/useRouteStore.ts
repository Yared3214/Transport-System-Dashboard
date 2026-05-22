import { create } from 'zustand';

interface RouteState {
  // Form State
  formData: {
    name: string;
    location_id: string;
    driver_id: string;
    type: 'entry' | 'exit';
    shift: 'AM' | 'PM';
    time: string;
    overtime_type: 'normal' | 'saturday' | 'sunday';
  };
  selectedIds: string[];
  driverIds: string[];

  // Master Data (Fetched from DB)
  allDrivers: any[];
  allEmployees: any[];
  offices: any[];
  
  // UI State
  loading: boolean;
  saving: boolean;
  sendingTelegram: boolean;

  // Actions
  setLoading: (val: boolean) => void;
  setSaving: (val: boolean) => void;
  setSendingTelegram: (val: boolean) => void;
  setDriverIds: (driverIds: any[]) => void;
  setFormData: (data: any) => void;
  updateFormField: (field: string, value: any) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleEmployee: (id: string) => void;
  reset: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  formData: {
    name: '',
    location_id: '',
    driver_id: '',
    type: 'entry',
    shift: 'AM',
    time: '08:00',
    overtime_type: 'normal',
  },
  selectedIds: [],
  driverIds: [],
  allDrivers: [],
  allEmployees: [],
  offices: [],
  loading: false,
  saving: false,
  sendingTelegram: false,

  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setSendingTelegram: (sendingTelegram) => set({ sendingTelegram }),
  
  setDriverIds: (driverIds) => 
    set({ driverIds }),

  setFormData: (formData) => set({ formData }),
  
  updateFormField: (field, value) => 
    set((state) => ({ formData: { ...state.formData, [field]: value } })),

  setSelectedIds: (selectedIds) => set({ selectedIds }),

  toggleEmployee: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(i => i !== id)
      : [...state.selectedIds, id]
  })),

  reset: () => set({
    formData: { name: '', location_id: '', driver_id: '', type: 'entry', shift: 'AM', time: '08:00', overtime_type: 'normal' },
    selectedIds: [],
  })
}));