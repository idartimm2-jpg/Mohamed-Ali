export type PostIdea = {
  id: string;
  title: string;
  description: string;
  format: string;
  caption: string;
};

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
