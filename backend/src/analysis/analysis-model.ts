import type { AnalysisPrompt } from './analysis-prompt.js';
import type { AnalysisResult } from './analysis-result.js';
import type { ChatPrompt } from './chat-prompt.js';

export interface ModelUsage {
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

export interface AnalysisModelOutput extends ModelUsage {
  result: AnalysisResult;
}

export interface ChatModelOutput extends ModelUsage {
  text: string;
}

export abstract class AnalysisModel {
  abstract analyze(prompt: AnalysisPrompt): Promise<AnalysisModelOutput>;

  abstract answer(prompt: ChatPrompt): Promise<ChatModelOutput>;
}
