import type { AnalysisPrompt } from './analysis-prompt.js';
import type { AnalysisResult } from './analysis-result.js';

export interface AnalysisModelOutput {
  result: AnalysisResult;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

export abstract class AnalysisModel {
  abstract analyze(prompt: AnalysisPrompt): Promise<AnalysisModelOutput>;
}
