// src/ai/flows/iteratively-generate-content.ts
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

const GenerateChapterContentInputSchema = z.object({
  bookDescription: z.string().describe('A high-level description of the book.'),
  targetAudience: z.string().describe('The target audience of the book.'),
  language: z.string().describe('The language of the book.'),
  chapterOutline: z.string().describe('The outline for the current chapter, including subchapters.'),
  previousChaptersContent: z.string().describe('The content of the previous chapters.'),
  difficultyLevel: z.string().describe('The target difficulty level of the book.'),
});

export type GenerateChapterContentInput = z.infer<
  typeof GenerateChapterContentInputSchema
>;

const GenerateChapterContentOutputSchema = z.object({
  chapterContent: z.string().describe('The generated content for the current chapter.'),
});

export type GenerateChapterContentOutput = z.infer<
  typeof GenerateChapterContentOutputSchema
>;

export async function generateChapterContent(
  input: GenerateChapterContentInput
): Promise<GenerateChapterContentOutput> {
  return generateChapterContentFlow(input);
}

const generateChapterContentPrompt = ai.definePrompt({
  name: 'generateChapterContentPrompt',
  input: {schema: GenerateChapterContentInputSchema},
  output: {schema: GenerateChapterContentOutputSchema},
  prompt: `You are an AI assistant specialized in writing books. Your task is to generate content for a specific chapter of a book, maintaining narrative coherence with the previous chapters.  The book should be written with consideration of the target audience, language and difficulty level.

Book Description: {{{bookDescription}}}
Target Audience: {{{targetAudience}}}
Language: {{{language}}}
Difficulty Level: {{{difficultyLevel}}}

Previous Chapters Content: {{{previousChaptersContent}}}

Chapter Outline: {{{chapterOutline}}}

Generate the content for the chapter based on the above information. The content should be well-written, engaging, and consistent with the overall book narrative.`,
});

const generateChapterContentFlow = ai.defineFlow(
  {
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterContentInputSchema,
    outputSchema: GenerateChapterContentOutputSchema,
  },
  async input => {
    const {output} = await generateChapterContentPrompt(input);
    return output!;
  }
);
