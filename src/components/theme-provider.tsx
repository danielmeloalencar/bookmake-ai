
'use client';

import { useSettings } from '@/context/SettingsContext';

// This component is a simple wrapper to ensure settings are applied.
// It doesn't render anything itself but relies on the context's useEffect.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useSettings(); // This hook contains the logic to apply the theme
  return <>{children}</>;
}
