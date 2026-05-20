export type Bilingual = { en: string; ru: string };

export type GeneratedResearch = {
  id: string;
  generatedAt: string;
  model: string;
  title: Bilingual;
  summary: Bilingual;
  body: Bilingual;
  tags: string[];
  threatActor: string | null;
  mitreTechniques: string[];
  relatedDetections: string[];
  references: string[];
};

export type ResearchSummary = Omit<GeneratedResearch, "body">;
