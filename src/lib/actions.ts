
'use server';

import {
  generateInitialOutline,
} from '@/ai/flows/generate-initial-outline';
import {
  generateChapterContent,
  type GenerateChapterContentInput,
} from '@/ai/flows/iteratively-generate-content';
import {configureGenkit} from '@/ai/genkit';
import type {Settings} from './types';
import { getMcpHost } from '@/ai/mcp-host';

type CreateOutlineInput = {
  bookDescription: string;
  targetAudience: string;
  language: string;
  difficultyLevel: string;
  numberOfChapters: number;
}


// Wrapper to ensure Genkit is configured before running an action
async function withConfiguredGenkit<T, U>(
  settings: Omit<Settings, 'theme'>,
  action: (input: T) => Promise<U>,
  input: T
): Promise<U> {
  await configureGenkit({
      aiProvider: settings.aiProvider,
      ollamaHost: settings.ollamaHost,
      ollamaModel: settings.ollamaModel,
    });
  // Also ensure MCP host is configured
  getMcpHost(settings.mcp);

  return action(input);
}

export async function createOutlineAction(
  input: CreateOutlineInput,
  settings: Omit<Settings, 'theme'>
) {
  try {
    const modelName = settings.aiProvider === 'ollama' ? `ollama/${settings.ollamaModel}` : 'gemini-1.5-flash';
    const actionInput = { ...input, modelName };
    const output = await withConfiguredGenkit(
      settings,
      generateInitialOutline,
      actionInput
    );
    return output;
  } catch (error: any) {
    console.error('Error generating initial outline:', error);
    throw new Error(error.message || 'Failed to generate book outline.');
  }
}

export async function generateChapterContentAction(
  input: GenerateChapterContentInput,
  settings: Omit<Settings, 'theme'>
) {
  try {
    const output = await withConfiguredGenkit(
      settings,
      generateChapterContent,
      input
    );
    return output;
  } catch (error: any) {
    console.error('Error generating chapter content:', error);
    throw new Error(error.message || 'Failed to generate chapter content.');
  }
}
