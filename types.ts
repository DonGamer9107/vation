export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type VideoAspectRatio = "16:9" | "9:16";

// Fix: Define the AIStudio interface to resolve the conflict with existing global types.
// FIX: Removed 'export' to avoid module scope collision with global types.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}
