import { z } from 'zod';

export const analysisResultSchema = z.object({
  summary: z.string(),
  observedFacts: z.array(
    z.object({
      statement: z.string(),
      evidence: z.string(),
    }),
  ),
  hypotheses: z.array(
    z.object({
      cause: z.string(),
      confidence: z.enum(['low', 'medium', 'high']),
      reasoning: z.string(),
    }),
  ),
  relatedDeployments: z.array(z.string()),
  suggestedInvestigation: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export function parseAnalysisResult(text: string | undefined): AnalysisResult {
  let json: unknown;

  try {
    json = JSON.parse(text ?? '');
  } catch {
    throw new Error('Model returned invalid JSON');
  }

  const result = analysisResultSchema.safeParse(json);

  if (!result.success) {
    throw new Error(
      `Model returned an invalid analysis: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
