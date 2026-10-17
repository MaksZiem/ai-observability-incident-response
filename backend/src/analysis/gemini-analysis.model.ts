import { type GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import {
  AnalysisModel,
  AnalysisModelOutput,
  ChatModelOutput,
  ModelUsage,
} from './analysis-model.js';
import type { AnalysisPrompt } from './analysis-prompt.js';
import {
  analysisResultSchema,
  parseAnalysisResult,
} from './analysis-result.js';
import type { ChatPrompt } from './chat-prompt.js';
import { ChatRole } from './entities/incident-chat-message.entity.js';

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

    return {
      result: parseAnalysisResult(response.text),
      ...this.toUsage(response),
    };
  }

  async answer({ system, messages }: ChatPrompt): Promise<ChatModelOutput> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: messages.map(({ role, content }) => ({
        role: role === ChatRole.ASSISTANT ? 'model' : 'user',
        parts: [{ text: content }],
      })),
      config: { systemInstruction: system, temperature: 0.2 },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error('Model returned an empty answer');
    }

    return { text, ...this.toUsage(response) };
  }

  private toUsage(response: GenerateContentResponse): ModelUsage {
    const metadata = response.usageMetadata;

    return {
      model: this.model,
      inputTokens: metadata?.promptTokenCount ?? null,
      outputTokens: metadata
        ? (metadata.candidatesTokenCount ?? 0) +
          (metadata.thoughtsTokenCount ?? 0)
        : null,
    };
  }
}
