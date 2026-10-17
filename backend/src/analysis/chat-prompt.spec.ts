import { describe, expect, it } from 'vitest';
import { buildChatPrompt } from './chat-prompt.js';
import { ChatRole } from './entities/incident-chat-message.entity.js';

describe('buildChatPrompt', () => {
  it('keeps the history and attaches fresh evidence to the new question', () => {
    const prompt = buildChatPrompt({
      evidence: '<evidence>\nDeployments:\n- v1.42.3\n</evidence>',
      history: [
        { role: ChatRole.USER, content: 'What changed?' },
        { role: ChatRole.ASSISTANT, content: 'v1.42.3 [deployment v1.42.3]' },
      ],
      question: 'Why did latency increase?',
    });

    expect(prompt.system).toContain('square brackets');
    expect(prompt.messages).toEqual([
      { role: ChatRole.USER, content: 'What changed?' },
      { role: ChatRole.ASSISTANT, content: 'v1.42.3 [deployment v1.42.3]' },
      {
        role: ChatRole.USER,
        content:
          '<evidence>\nDeployments:\n- v1.42.3\n</evidence>\n\nQuestion: Why did latency increase?',
      },
    ]);
  });
});
