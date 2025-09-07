'use server';

/**
 * @fileOverview A flow to generate the initial outline of a book based on user input.
 *
 * - generateInitialOutline - A function that generates the initial book outline.
 * - GenerateInitialOutlineInput - The input type for the generateInitialOutline function.
 * - GenerateInitialOutlineOutput - The return type for the generateInitialOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialOutlineInputSchema = z.object({
  bookDescription: z.string().describe('A description of the book.'),
  targetAudience: z.string().describe('The target audience for the book.'),
  language: z.string().describe('The language of the book.'),
  difficultyLevel: z.string().describe('The difficulty level of the book.'),
  numberOfChapters: z
    .number()
    .describe('The desired number of chapters in the book.'),
  modelName: z.string().describe('The model to use for generation.'),
});
export type GenerateInitialOutlineInput = z.infer<
  typeof GenerateInitialOutlineInputSchema
>;

const GenerateInitialOutlineOutputSchema = z.object({
  outline: z
    .array(
      z.object({
        chapterTitle: z.string().describe('The title of the chapter.'),
        subchapters: z
          .array(z.string())
          .describe('The subchapters of the chapter.'),
      })
    )
    .describe(
      'The generated outline for the book, with chapter titles and subchapters.'
    ),
});
export type GenerateInitialOutlineOutput = z.infer<
  typeof GenerateInitialOutlineOutputSchema
>;

export async function generateInitialOutline(
  input: GenerateInitialOutlineInput
): Promise<GenerateInitialOutlineOutput> {
  return generateInitialOutlineFlow(input);
}

const generateInitialOutlineFlow = ai.defineFlow(
  {
    name: 'generateInitialOutlineFlow',
    inputSchema: GenerateInitialOutlineInputSchema,
    outputSchema: GenerateInitialOutlineOutputSchema,
  },
  async ({modelName, ...promptData}) => {
    const prompt = ai.definePrompt({
      name: 'generateInitialOutlinePrompt',
      input: {schema: z.any()},
      output: {schema: GenerateInitialOutlineOutputSchema},
      prompt: `You are an AI assistant helping a user create a book outline.

        Based on the following information, generate an outline for the book, including chapter titles and subchapters. The number of chapters is a suggestion and you can deviate from it if needed.

        Book Description: {{{bookDescription}}}
        Target Audience: {{{targetAudience}}}
        Language: {{{language}}}
        Difficulty Level: {{{difficultyLevel}}}
        Number of Chapters: {{{numberOfChapters}}}

        Outline:`,
    });

    const {output} = await prompt(promptData, {model: modelName});
    return output!;
  }
);
