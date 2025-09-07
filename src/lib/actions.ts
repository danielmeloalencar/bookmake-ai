'use server';

import {
  generateInitialOutline,
  type GenerateInitialOutlineInput,
} from '@/ai/flows/generate-initial-outline';
import {
  generateChapterContent,
  type GenerateChapterContentInput,
} from '@/ai/flows/iteratively-generate-content';
import {configureGenkit} from '@/ai/genkit';

async function configureGenkitForAction(modelName?: string) {
  if (modelName?.startsWith('ollama/')) {
    const ollamaHost = process.env.OLLAMA_HOST;
    if (!ollamaHost) {
      throw new Error(
        'OLLAMA_HOST environment variable is not set. Please configure it in your .env file for server-side Ollama requests.'
      );
    }
    configureGenkit({
      provider: 'Ollama',
      ollamaHost,
    });
  } else {
    configureGenkit({provider: 'Google'});
  }
}

export async function createOutlineAction(input: GenerateInitialOutlineInput) {
  try {
    await configureGenkitForAction(input.modelName);
    const output = await generateInitialOutline(input);
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
    await configureGenkitForAction(input.modelName);
    const output = await generateChapterContent(input);
    return output;
  } catch (error: any) {
    console.error('Error generating chapter content:', error);
    throw new Error(error.message || 'Failed to generate chapter content.');
  }
}
