
import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

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

  const {
    aiProvider = 'ollama',
    ollamaHost,
    ollamaModel,
  } = config;

  if (aiProvider === 'ollama' && ollamaHost && ollamaModel) {
    try {
      // Dynamically import ollama only when it's configured.
      // This avoids Next.js trying to resolve the module when it's not needed.
      const {ollama} = await import('genkitx-ollama');
      plugins.push(
        ollama({
          models: [{name: ollamaModel, type: 'generate'}],
          serverAddress: ollamaHost,
          timeout: 600000, // 10 minutes
        })
      );
    } catch (error) {
      console.error("Failed to load Ollama plugin, falling back to Google AI", error);
      // Fallback to Google AI if ollama plugin fails to load
      plugins.push(googleAI());
    }
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
