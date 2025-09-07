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

// Since we are only using Google AI for now, we can configure it once.
// If we re-add other providers, this logic will need to be more dynamic.
configureGenkit({provider: 'Google'});

export async function createOutlineAction(input: GenerateInitialOutlineInput) {
  try {
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
    const output = await generateChapterContent(input);
    return output;
  } catch (error: any) {
    console.error('Error generating chapter content:', error);
    throw new Error(error.message || 'Failed to generate chapter content.');
  }
}
