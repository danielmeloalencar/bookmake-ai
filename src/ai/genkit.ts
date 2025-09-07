import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The `ai` object now uses a getter to ensure it's always using the latest configuration.
export const ai = genkit({
  plugins: [googleAI()],
});
