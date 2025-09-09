
import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAICompatible} from '@genkit-ai/compat-oai';

interface GenkitConfig {
  aiProvider?: 'google' | 'ollama';
  ollamaHost?: string;
  ollamaModel?: string;
}

// Store the configured instance
let configuredAi: any;

// Function to configure Genkit dynamically
export const configureGenkit = async (config: GenkitConfig = {}) => {
  const plugins: Plugin[] = [];

  const {aiProvider = 'google', ollamaHost, ollamaModel} = config;

  if (aiProvider === 'ollama' && ollamaHost && ollamaModel) {
    // This configuration is currently causing issues and is disabled.
    // Defaulting to Google AI.
    plugins.push(googleAI());
    
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
