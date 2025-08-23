import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  OnboardingProgress, 
  ClientInput, 
  Client, 
  ClientStatus 
} from '@/types';

export interface OnboardingState {
  // Current onboarding session
  currentClient: Client | null;
  currentProgress: OnboardingProgress | null;
  isOnboardingActive: boolean;
  
  // UI state
  currentView: 'landing' | 'form' | 'orchestration' | 'complete' | 'dashboard';
  showOnboardingModal: boolean;
  isLoading: boolean;
  error: string | null;
  
  // WebSocket state
  isConnected: boolean;
  
  // Client history for dashboard
  clients: Client[];
  
  // Actions
  setCurrentClient: (client: Client | null) => void;
  setCurrentProgress: (progress: OnboardingProgress | null) => void;
  setOnboardingActive: (active: boolean) => void;
  setCurrentView: (view: OnboardingState['currentView']) => void;
  setShowOnboardingModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  addClient: (client: Client) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  reset: () => void;
}

const initialState = {
  currentClient: null,
  currentProgress: null,
  isOnboardingActive: false,
  currentView: 'landing' as const,
  showOnboardingModal: false,
  isLoading: false,
  error: null,
  isConnected: false,
  clients: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentClient: (client) => set({ currentClient: client }),
      
      setCurrentProgress: (progress) => set({ currentProgress: progress }),
      
      setOnboardingActive: (active) => set({ isOnboardingActive: active }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setShowOnboardingModal: (show) => set({ showOnboardingModal: show }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setConnected: (connected) => set({ isConnected: connected }),
      
      addClient: (client) => {
        const { clients } = get();
        const existingIndex = clients.findIndex(c => c.id === client.id);
        
        if (existingIndex >= 0) {
          // Update existing client
          const updatedClients = [...clients];
          updatedClients[existingIndex] = client;
          set({ clients: updatedClients });
        } else {
          // Add new client
          set({ clients: [client, ...clients] });
        }
      },
      
      updateClient: (clientId, updates) => {
        const { clients } = get();
        const updatedClients = clients.map(client =>
          client.id === clientId ? { ...client, ...updates } : client
        );
        set({ clients: updatedClients });
        
        // Also update current client if it matches
        const { currentClient } = get();
        if (currentClient?.id === clientId) {
          set({ currentClient: { ...currentClient, ...updates } });
        }
      },
      
      reset: () => set({
        currentClient: null,
        currentProgress: null,
        isOnboardingActive: false,
        currentView: 'landing',
        showOnboardingModal: false,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({
        clients: state.clients,
        currentClient: state.currentClient,
        currentProgress: state.currentProgress,
        isOnboardingActive: state.isOnboardingActive,
      }),
    }
  )
);

// Analytics derived state
export const useAnalytics = () => {
  const clients = useOnboardingStore(state => state.clients);
  
  const completedClients = clients.filter(c => c.status === ClientStatus.COMPLETED);
  const inProgressClients = clients.filter(c => c.status === ClientStatus.IN_PROGRESS);
  const failedClients = clients.filter(c => c.status === ClientStatus.FAILED);
  
  // Mock time calculations (in real app, this would come from progress data)
  const avgTimeToOnboard = completedClients.length > 0 
    ? Math.round(completedClients.reduce((acc, client) => {
        // Mock calculation: random time between 15-45 minutes
        const mockTime = 15 + Math.random() * 30;
        return acc + mockTime;
      }, 0) / completedClients.length)
    : 0;
  
  // Assuming manual process takes 5-6 hours (320 minutes average)
  const manualProcessTime = 320; // minutes
  const automatedProcessTime = avgTimeToOnboard; // minutes
  const timeSavedPerClient = manualProcessTime - automatedProcessTime;
  const totalTimeSaved = completedClients.length * timeSavedPerClient;
  
  // Assuming $50/hour for manual work
  const hourlyRate = 50;
  const totalMoneySaved = (totalTimeSaved / 60) * hourlyRate;
  
  return {
    totalClients: clients.length,
    completedClients: completedClients.length,
    inProgressClients: inProgressClients.length,
    failedClients: failedClients.length,
    avgTimeToOnboard,
    totalTimeSaved: Math.round(totalTimeSaved),
    totalMoneySaved: Math.round(totalMoneySaved),
    successRate: clients.length > 0 ? Math.round((completedClients.length / clients.length) * 100) : 0,
  };
};