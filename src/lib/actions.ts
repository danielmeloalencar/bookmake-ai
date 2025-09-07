'use server';

import {
  generateInitialOutline,
  type GenerateInitialOutlineInput,
} from '@/ai/flows/generate-initial-outline';
import {
  generateChapterContent,
  type GenerateChapterContentInput,
} from '@/ai/flows/iteratively-generate-content';

export async function createOutlineAction(
  input: GenerateInitialOutlineInput,
) {
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
