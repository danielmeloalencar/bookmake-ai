import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkit-plugin-ollama';

interface GenkitConfig {
  ollamaHost?: string;
}

// This is not a hook, so it's ok to call it conditionally.
// The user settings are stored in local storage, so we need to read it from there.
const getConfig = (): GenkitConfig => {
  if (typeof window === 'undefined') {
    return {};
  }
  const ollamaHost = localStorage.getItem('ollamaHost');
  return {
    ollamaHost: ollamaHost || undefined,
  };
};

const {ollamaHost} = getConfig();

const plugins: Plugin[] = [googleAI()];

if (ollamaHost) {
  plugins.push(
    ollama({
      host: ollamaHost,
      models: [], // We will specify the model dynamically
    })
  );
}

export const ai = genkit({
  plugins,
  // We set a default model, but we will override it in the flows.
  model: 'googleai/gemini-1.5-flash',
});
