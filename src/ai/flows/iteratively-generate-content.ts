'use server';

/**
 * @fileOverview Generates content for each chapter and subchapter of a book sequentially,
 * maintaining narrative coherence by using previously generated content as context.
 *
 * - generateChapterContent - A function that generates chapter content based on the book description,
 *   previous chapters, and the current chapter's outline.
 * - GenerateChapterContentInput - The input type for the generateChapterContent function.
 * - GenerateChapterContentOutput - The return type for the generateChapterContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Handlebars from 'handlebars';
import {googleAI} from '@genkit-ai/googleai';

const GenerateChapterContentInputSchema = z.object({
  bookDescription: z.string().describe('A high-level description of the book.'),
  targetAudience: z.string().describe('The target audience of the book.'),
  language: z.string().describe('The language of the book.'),
  chapterOutline: z
    .string()
    .describe('The outline for the current chapter, including subchapters.'),
  previousChaptersContent: z
    .string()
    .describe('The content of the previous chapters.'),
  difficultyLevel: z
    .string()
    .describe('The target difficulty level of the book.'),
  currentContent: z
    .string()
    .optional()
    .describe('The existing content of the chapter to be refined or modified.'),
  extraPrompt: z
    .string()
    .optional()
    .describe(
      'Extra instructions or prompt to guide content generation/modification.'
    ),
  minWords: z
    .number()
    .optional()
    .describe('The minimum number of words for the generated content.'),
  temperature: z
    .number()
    .optional()
    .describe('Controls randomness. Higher values increase creativity.'),
  seed: z.number().optional().describe('A seed for deterministic generation.'),
  modelName: z.string().optional().describe('The name of the model to use.'),
});

export type GenerateChapterContentInput = z.infer<
  typeof GenerateChapterContentInputSchema
>;

const GenerateChapterContentOutputSchema = z.object({
  chapterContent: z
    .string()
    .describe('The generated content for the current chapter.'),
});

export type GenerateChapterContentOutput = z.infer<
  typeof GenerateChapterContentOutputSchema
>;

export async function generateChapterContent(
  input: GenerateChapterContentInput
): Promise<GenerateChapterContentOutput> {
  return generateChapterContentFlow(input);
}

const promptTemplate = `You are an AI assistant specialized in writing books. Your task is to write or refine the content for a specific chapter of a book, maintaining narrative coherence with the previous chapters. The book should be written with consideration of the target audience, language and difficulty level.

Do not add chapter numbering in the content, just the text itself.

If existing content for the chapter is provided as 'Current Content', your task is to refine or modify it based on the 'Additional Instructions'. If 'Current Content' is empty, you should write the chapter from scratch based on the outline.

Book Description: {{bookDescription}}
Target Audience: {{targetAudience}}
Language: {{language}}
Difficulty Level: {{difficultyLevel}}

Previous Chapters Content:
{{{previousChaptersContent}}}

Current Chapter Outline:
{{{chapterOutline}}}

{{#if currentContent}}
Current Content (to be refined or modified):
{{{currentContent}}}
{{/if}}

{{#if extraPrompt}}
Additional Instructions: {{{extraPrompt}}}
{{/if}}

{{#if minWords}}
The chapter content should have at least {{{minWords}}} words.
{{/if}}

Generate the new, complete content for the current chapter. The content should be well-written, engaging, and consistent with the overall book narrative.`;

const generateChapterContentFlow = ai.defineFlow(
  {
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterContentInputSchema,
    outputSchema: GenerateChapterContentOutputSchema,
  },
  async ({modelName, ...input}) => {
    const template = Handlebars.compile(promptTemplate);
    const finalPrompt = template(input);
    const model = modelName
      ? ai.model(modelName)
      : googleAI.model('gemini-1.5-flash');

    const {output} = await ai.generate({
      prompt: finalPrompt,
      model,
      output: {
        schema: GenerateChapterContentOutputSchema,
      },
      config: {
        temperature: input.temperature,
        seed: input.seed,
      },
    });

    return output!;
  }
);
