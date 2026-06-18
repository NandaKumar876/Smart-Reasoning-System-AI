export type StepType = 'decompose' | 'analyze' | 'reason' | 'conclude';

export interface ReasoningStep {
  type: StepType;
  title: string;
  content: string;
  why: string;
}

export interface ReasoningResult {
  steps: ReasoningStep[];
  final_answer: string;
}

export interface ReasoningSession {
  id: string;
  problem: string;
  steps: ReasoningStep[];
  final_answer: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

export interface SessionStats {
  total_sessions: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_latency_ms: number;
  avg_steps: number;
  success_rate: number;
}
