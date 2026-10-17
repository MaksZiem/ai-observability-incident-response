import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import { AnalysisModel, AnalysisModelOutput } from './analysis-model.js';
import type { AnalysisPrompt } from './analysis-prompt.js';
import {
  analysisResultSchema,
  parseAnalysisResult,
} from './analysis-result.js';

const GEMINI_TIMEOUT_MS = 120_000;
const RESPONSE_SCHEMA = z.toJSONSchema(analysisResultSchema, {
  target: 'openapi-3.0',
});

@Injectable()
export class GeminiAnalysisModel extends AnalysisModel {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.client = new GoogleGenAI({
      apiKey: config.get('GEMINI_API_KEY', { infer: true }),
      httpOptions: { timeout: GEMINI_TIMEOUT_MS },
    });
    this.model = config.get('GEMINI_MODEL', { infer: true });
  }

  async analyze({
    system,
    user,
  }: AnalysisPrompt): Promise<AnalysisModelOutput> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });

    const metadata = response.usageMetadata;

    return {
      result: parseAnalysisResult(response.text),
      model: this.model,
      inputTokens: metadata?.promptTokenCount ?? null,
      outputTokens: metadata
        ? (metadata.candidatesTokenCount ?? 0) +
          (metadata.thoughtsTokenCount ?? 0)
        : null,
    };
  }
}
