import { 
  ClientInput, 
  ApiResponse, 
  ClientCreatedResponse, 
  OnboardingStatusResponse,
  ApprovalResponse,
  SuccessResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Onboarding endpoints
  async startOnboarding(clientData: ClientInput): Promise<ClientCreatedResponse> {
    return this.request<ClientCreatedResponse>('/onboarding/start', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async getOnboardingStatus(clientId: string): Promise<OnboardingStatusResponse> {
    return this.request<OnboardingStatusResponse>(`/onboarding/status/${clientId}`);
  }

  async approveStep(
    clientId: string, 
    stepId: string, 
    approved: boolean, 
    feedback?: string
  ): Promise<ApprovalResponse> {
    const params = new URLSearchParams({
      approved: approved.toString(),
      ...(feedback && { feedback }),
    });

    return this.request<ApprovalResponse>(
      `/onboarding/approve/${clientId}/${stepId}?${params}`,
      { method: 'POST' }
    );
  }

  async listClients(
    status?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SuccessResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(status && { status }),
    });

    return this.request<SuccessResponse>(`/onboarding/clients?${params}`);
  }

  async getClient(clientId: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/onboarding/client/${clientId}`);
  }

  async deleteClient(clientId: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/onboarding/client/${clientId}`, {
      method: 'DELETE',
    });
  }

  async simulateOnboarding(clientId: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/onboarding/simulate/${clientId}`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/health');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Utility functions for common operations
export const onboardingApi = {
  start: (data: ClientInput) => apiClient.startOnboarding(data),
  status: (clientId: string) => apiClient.getOnboardingStatus(clientId),
  approve: (clientId: string, stepId: string, approved: boolean, feedback?: string) =>
    apiClient.approveStep(clientId, stepId, approved, feedback),
  simulate: (clientId: string) => apiClient.simulateOnboarding(clientId),
};

export const clientsApi = {
  list: (status?: string, limit?: number, offset?: number) =>
    apiClient.listClients(status, limit, offset),
  get: (clientId: string) => apiClient.getClient(clientId),
  delete: (clientId: string) => apiClient.deleteClient(clientId),
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};