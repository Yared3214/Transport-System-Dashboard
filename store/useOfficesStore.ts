import { create } from 'zustand';

interface OfficeState {
  offices: any[];

  setOffices: (offices: any[]) => void;
  updateOffice: (field: string, value: any) => void;
  reset: () => void;
}

export const useOfficesStore = create<OfficeState>((set) => ({
    offices: [],
  
    setOffices: (offices) => 
    set({offices}),
  
    updateOffice: (field, value) => 
    set((state) => ({ offices: { ...state.offices, [field]: value } })),

  reset: () => set({
    offices: [],
  })
}));