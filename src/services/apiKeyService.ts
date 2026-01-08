import { localStorageService } from './localStorageService';

export function getApiKey(): string | null {
  const userApiKey = localStorageService.getUserApiKey();
  if (userApiKey) {
    return userApiKey;
  }
  
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envApiKey) {
    return envApiKey;
  }
  
  return null;
}
