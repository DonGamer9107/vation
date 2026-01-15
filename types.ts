export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type VideoAspectRatio = "16:9" | "9:16";

/**
 * Interface representing the AI Studio environment API.
 */
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Fix: Use the named AIStudio interface within declare global to ensure consistent typing across modules.
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}