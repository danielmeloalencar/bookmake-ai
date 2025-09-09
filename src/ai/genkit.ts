
import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'genkitx-ollama';
import { setGlobalDispatcher, Agent } from 'undici';

interface GenkitConfig {
  aiProvider?: 'google' | 'ollama';
  ollamaHost?: string;
  ollamaModel?: string;
}

// Store the configured instance
let configuredAi: any;

const TEN_MINUTES_IN_MS = 600000;

// Set a global dispatcher with a long timeout for all fetch requests.
// This is necessary to prevent timeouts when using Ollama with large models.
setGlobalDispatcher(new Agent({
  headersTimeout: TEN_MINUTES_IN_MS,
  bodyTimeout: TEN_MINUTES_IN_MS,
}));


// Function to configure Genkit dynamically
export const configureGenkit = async (config: GenkitConfig = {}) => {
  const plugins: Plugin[] = [];

  const {aiProvider = 'google', ollamaHost, ollamaModel} = config;

  if (aiProvider === 'ollama' && ollamaHost && ollamaModel) {
    plugins.push(
      ollama({
        serverAddress: ollamaHost,
        models: [{ name: ollamaModel }],
      })
    );
  } else {
    // Default to Google AI
    plugins.push(googleAI());
  }

  configuredAi = genkit({plugins});
};

// Export a getter that ensures Genkit is configured before use
export const ai = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (!configuredAi) {
        // Configure with default if not already configured.
        // This is a safeguard for environments where configureGenkit isn't explicitly called.
        configureGenkit();
      }
      return Reflect.get(configuredAi, prop);
    },
  }
);
