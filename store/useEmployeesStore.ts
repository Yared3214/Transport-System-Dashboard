import { create } from 'zustand';

interface EmployeeStore {
  employees: any[];

  setEmployees: (employees: any[]) => void;
  updateEmployees: (field: string, value: any) => void;
  reset: () => void;
}

export const useEmployeesStore = create<EmployeeStore>((set) => ({
    employees: [],
  
    setEmployees: (employees) => 
    set({employees}),
  
    updateEmployees: (field, value) => 
    set((state) => ({ employees: { ...state.employees, [field]: value } })),

  reset: () => set({
    employees: [],
  })
}));