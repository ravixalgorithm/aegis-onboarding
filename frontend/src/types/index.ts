// Client and Onboarding Types
export interface ClientInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  project_type: ProjectType;
  project_scope: string;
  budget_range?: string;
  timeline?: string;
  additional_notes?: string;
}

export enum ProjectType {
  WEB_DEVELOPMENT = "web_development",
  MOBILE_APP = "mobile_app",
  DESIGN = "design",
  MARKETING = "marketing",
  CONSULTING = "consulting",
  OTHER = "other"
}

export enum ClientStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface Client extends ClientInput {
  id: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  drive_folder_id?: string;
  contract_doc_id?: string;
  slack_channel_id?: string;
  github_repo_url?: string;
  notion_board_id?: string;
  stripe_customer_id?: string;
  invoice_id?: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface OnboardingProgress {
  client_id: string;
  steps: OnboardingStep[];
  current_step: number;
  overall_status: ClientStatus;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
}

// API Response Types
export interface BaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data?: T;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error_code?: string;
  details?: Record<string, any>;
}

export interface ClientCreatedResponse extends SuccessResponse {
  client_id: string;
  data: {
    client: Client;
    progress: OnboardingProgress;
  };
}

export interface OnboardingStatusResponse extends SuccessResponse {
  client_id: string;
  status: string;
  progress_percentage: number;
  current_step: string;
  steps: OnboardingStep[];
  data: {
    client: Client;
    progress?: OnboardingProgress;
    started_at?: string;
    completed_at?: string;
  };
}

export interface ApprovalResponse extends BaseResponse {
  client_id: string;
  step_id: string;
  approved: boolean;
  feedback?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  client_id: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface StepUpdateMessage extends WebSocketMessage {
  type: "step_update";
  step_id: string;
  step_status: string;
  progress_percentage: number;
}

export interface ApprovalRequestMessage extends WebSocketMessage {
  type: "approval_request";
  step_id: string;
  approval_data: Record<string, any>;
}

export interface OnboardingCompleteMessage extends WebSocketMessage {
  type: "onboarding_complete";
  completion_data: Record<string, any>;
}

export interface ErrorMessage extends WebSocketMessage {
  type: "error";
  error_code?: string;
  error_details?: Record<string, any>;
}

// UI Component Props
export interface ProgressStepProps {
  step: OnboardingStep;
  isActive: boolean;
  isCompleted: boolean;
  index: number;
}

export interface StatusDashboardProps {
  progress: OnboardingProgress | null;
  onApprove: (stepId: string, approved: boolean, feedback?: string) => void;
}

export interface ClientFormProps {
  onSubmit: (data: ClientInput) => void;
  isLoading: boolean;
}

export interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approved: boolean, feedback?: string) => void;
  approvalData: Record<string, any>;
  stepName: string;
}

// Form Validation Schema
export const projectTypeOptions = [
  { value: ProjectType.WEB_DEVELOPMENT, label: "Web Development" },
  { value: ProjectType.MOBILE_APP, label: "Mobile App" },
  { value: ProjectType.DESIGN, label: "Design" },
  { value: ProjectType.MARKETING, label: "Marketing" },
  { value: ProjectType.CONSULTING, label: "Consulting" },
  { value: ProjectType.OTHER, label: "Other" },
];

// Utility Types
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connect: (clientId: string) => void;
  disconnect: () => void;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}