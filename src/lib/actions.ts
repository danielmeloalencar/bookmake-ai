
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

type CreateOutlineInput = {
  bookDescription: string;
  targetAudience: string;
  language: string;
  difficultyLevel: string;
  numberOfChapters: number;
}

type SerializableSettings = Omit<Settings, 'theme'>;


// Wrapper to ensure Genkit is configured before running an action
async function withConfiguredGenkit<T extends { settings: SerializableSettings }>(
  action: (input: T) => Promise<any>,
  input: T
): Promise<any> {
  const { settings, ...rest } = input;
  await configureGenkit({
      aiProvider: settings.aiProvider,
      ollamaHost: settings.ollamaHost,
      ollamaModel: settings.ollamaModel,
    });

  return action(input);
}

export async function createOutlineAction(
  input: CreateOutlineInput,
  settings: SerializableSettings
) {
  try {
    const modelName = settings.aiProvider === 'ollama' ? `ollama/${settings.ollamaModel}` : 'gemini-1.5-flash';
    // This is a bit of a hack to pass settings through the action.
    const actionInput = { ...input, modelName, settings };
    const output = await withConfiguredGenkit(
      (wrappedInput) => generateInitialOutline(wrappedInput as any),
      actionInput as any
    );
    return output;
  } catch (error: any) {
    console.error('Error generating initial outline:', error);
    throw new Error(error.message || 'Failed to generate book outline.');
  }
}

export async function generateChapterContentAction(
  input: GenerateChapterContentInput
) {
  try {
    const output = await withConfiguredGenkit(
      generateChapterContent,
      input
    );
    return output;
  } catch (error: any) {
    console.error('Error generating chapter content:', error);
    throw new Error(error.message || 'Failed to generate chapter content.');
  }
}
