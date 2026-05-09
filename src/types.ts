export type PostIdea = {
  id: string;
  title: string;
  description: string;
  format: string;
  caption: string;
};

export type HistoryItem = {
  id: string;
  date: string;
  type: 'content' | 'growth';
  title: string;
  data: any;
};

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
