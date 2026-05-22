import { create } from 'zustand';

interface DriverState {
  drivers: any[];

  setDrivers: (drivers: any[]) => void;
  updateDriver: (field: string, value: any) => void;
  reset: () => void;
}

export const useDriversStore = create<DriverState>((set) => ({
  drivers: [],
  
  setDrivers: (drivers) => 
    set({drivers}),
  
  updateDriver: (field, value) => 
    set((state) => ({ drivers: { ...state.drivers, [field]: value } })),

  reset: () => set({
    drivers: [],
  })
}));