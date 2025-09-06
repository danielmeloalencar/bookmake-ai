import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-outline.ts';
import '@/ai/flows/iteratively-generate-content.ts';