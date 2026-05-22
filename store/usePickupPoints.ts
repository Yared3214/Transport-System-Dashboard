import { create } from 'zustand';

interface PickupPointState {
  pickupPoints: any[];

  setPickupPoints: (pickupPoints: any[]) => void;
  updatePickupPoints: (field: string, value: any) => void;
  reset: () => void;
}

export const usePickupPointsStore = create<PickupPointState>((set) => ({
    pickupPoints: [],
  
    setPickupPoints: (pickupPoints) => 
    set({pickupPoints}),
  
    updatePickupPoints: (field, value) => 
    set((state) => ({ pickupPoints: { ...state.pickupPoints, [field]: value } })),

  reset: () => set({
    pickupPoints: [],
  })
}));