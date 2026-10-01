/** Read-only learning content. Never participates in assessment or saved scores. */
export type WalkthroughListItem = { text: string; children?: WalkthroughBlock[] };
export type WalkthroughBlock =
  | { kind: "paragraph" | "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: WalkthroughListItem[] }
  | { kind: "table"; columns: string[]; rows: string[][] };
export type WalkthroughSection = { heading: string; blocks: WalkthroughBlock[] };
export type LessonWalkthrough = {
  lessonId: string;
  lessonNumber: number;
  title: string;
  intro: WalkthroughBlock[];
  sections: WalkthroughSection[];
  practice?: { prompt: WalkthroughBlock[]; answer: WalkthroughBlock[] };
  notes: string[];
  sources?: { label: string; url: string }[];
};
