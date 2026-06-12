export type SymbolMeaning = {
  name: string;
  label: string;
  meaning: string;
};

export type AnalysisResult = {
  source?: "openai";
  interpretation: string;
  emotionalSummary: string;
  currentStateReflection: string;
  dominantScene: string;
  sceneSummary: string;
  scenePrompt: string;
  symbols: SymbolMeaning[];
  imagePath?: string;
  imagePrompt?: string;
  imageGeneratedAt?: string;
};

export type DreamEntry = {
  id: string;
  title: string;
  dreamText: string;
  moodTags: string[];
  symbolTags: string[];
  createdAt: string;
  analysis?: AnalysisResult;
};

export type RankedItem = {
  name: string;
  count: number;
};

export type DreamReport = {
  topMoods: RankedItem[];
  topSymbols: RankedItem[];
  insight: string;
  recentFocus: {
    mood: string;
    symbolLabel: string;
    summary: string;
  };
  comparison: {
    summary: string;
  };
  highlightMoments: string[];
};

export type ReportInput = {
  moodTags: string[];
  symbolTags: string[];
  title?: string;
  createdAt?: string;
};
