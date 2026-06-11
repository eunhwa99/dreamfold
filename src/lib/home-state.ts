import type { DreamEntry } from "@/lib/dreams/types";

type HomePageStateInput = {
  mood: string | null;
  dreams: DreamEntry[];
};

type BaseState = {
  dreams: DreamEntry[];
  filteredDreams: DreamEntry[];
};

type EmptyState = BaseState & {
  type: "empty";
};

type EmptyFilterState = BaseState & {
  type: "empty-filter";
  mood: string;
};

type ReadyState = BaseState & {
  type: "ready";
  latestDream: DreamEntry;
};

export type HomePageState = EmptyState | EmptyFilterState | ReadyState;

export function getHomePageState({ mood, dreams }: HomePageStateInput): HomePageState {
  const filteredDreams = mood ? dreams.filter((dream) => dream.moodTags.includes(mood)) : dreams;

  if (dreams.length === 0) {
    return {
      type: "empty",
      dreams,
      filteredDreams
    };
  }

  if (mood && filteredDreams.length === 0) {
    return {
      type: "empty-filter",
      mood,
      dreams,
      filteredDreams
    };
  }

  return {
    type: "ready",
    dreams,
    filteredDreams,
    latestDream: filteredDreams[0] ?? dreams[0]
  };
}
