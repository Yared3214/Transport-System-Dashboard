import { create } from 'zustand';

interface RequestState {
  requests: any[];

  setRequests: (requests: any[]) => void;
  removeRequest: (id: string) => void;
  reset: () => void;
}

export const useRequestsStore = create<RequestState>((set) => ({
    requests: [],
  
    setRequests: (requests) => 
    set({requests}),

    removeRequest: (id) => 
    set((state) => ({ requests: state.requests.filter(request => request.id !== id) })),

  reset: () => set({
    requests: [],
  })
}));