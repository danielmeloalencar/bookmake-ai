import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This configuration object is now dynamically populated by `configureGenkit`.
let genkitConfig = {
  plugins: [googleAI()],
};

// This function allows dynamically setting up Genkit plugins.
export const configureGenkit = (options: {
  provider: 'Google' | 'Ollama';
  ollamaHost?: string;
}) => {
  const plugins: Plugin[] = [googleAI()];

  // Dynamically import ollama only when it's configured.
  // This avoids Next.js trying to resolve the module when it's not needed.
  if (options.provider === 'Ollama' && options.ollamaHost) {
    try {
      const {ollama} = require('genkit-plugin-ollama');
      plugins.push(
        ollama({
          host: options.ollamaHost,
        })
      );
    } catch (e) {
      console.error(
        'Failed to load Ollama plugin. Make sure `genkit-plugin-ollama` is installed.',
        e
      );
    }
  }

  genkitConfig = {
    plugins,
  };
};

// The `ai` object now uses a getter to ensure it's always using the latest configuration.
export const ai = new Proxy(
  {},
  {
    get: (target, prop) => {
      const genkitInstance = genkit(genkitConfig);
      return Reflect.get(genkitInstance, prop);
    },
  }
) as ReturnType<typeof genkit>;
