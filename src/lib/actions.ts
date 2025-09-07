
'use server';

import {
  generateInitialOutline,
  type GenerateInitialOutlineInput,
} from '@/ai/flows/generate-initial-outline';
import {
  generateChapterContent,
  type GenerateChapterContentInput,
} from '@/ai/flows/iteratively-generate-content';
import {configureGenkit, type GenkitConfig} from '@/ai/genkit';

// Wrapper to ensure Genkit is configured before running an action
async function withConfiguredGenkit<T, U>(
  settings: GenkitConfig,
  action: (input: T) => Promise<U>,
  input: T
): Promise<U> {
  await configureGenkit(settings);
  return action(input);
}

export async function createOutlineAction(
  input: GenerateInitialOutlineInput,
  settings: GenkitConfig
) {
  try {
    const output = await withConfiguredGenkit(
      settings,
      generateInitialOutline,
      input
    );
    return output;
  } catch (error: any) {
    console.error('Error generating initial outline:', error);
    throw new Error(error.message || 'Failed to generate book outline.');
  }
}

export async function generateChapterContentAction(
  input: GenerateChapterContentInput,
  settings: GenkitConfig
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
