import { getSymbolLabel } from "@/lib/dreams/catalog";
import type { DreamReport, ReportInput } from "@/lib/dreams/types";

function rank(values: string[]) {
  return [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function buildDreamReport(entries: ReportInput[]): DreamReport {
  const topMoods = rank(entries.flatMap((entry) => entry.moodTags));
  const topSymbols = rank(entries.flatMap((entry) => entry.symbolTags));
  const recentEntries = entries.slice(0, 3);
  const olderEntries = entries.slice(3);
  const recentMoods = rank(recentEntries.flatMap((entry) => entry.moodTags));
  const recentSymbols = rank(recentEntries.flatMap((entry) => entry.symbolTags));
  const olderMoods = rank(olderEntries.flatMap((entry) => entry.moodTags));

  const recentFocus = {
    mood: recentMoods[0]?.name ?? topMoods[0]?.name ?? "여운",
    symbolLabel: getSymbolLabel(recentSymbols[0]?.name ?? topSymbols[0]?.name ?? "mist"),
    summary:
      recentEntries.length === 0
        ? "아직 최근 흐름을 읽을 만큼 기록이 쌓이지 않았어요."
        : `최근 ${recentEntries.length}개의 꿈에서 ${recentMoods[0]?.name ?? "설명하기 어려운 감정"}과 ${getSymbolLabel(
            recentSymbols[0]?.name ?? "mist"
          )} 이미지가 가장 자주 돌아오고 있어요.`
  };

  const comparison =
    olderEntries.length === 0
      ? {
          summary: "이전 기록이 더 쌓이면 최근 흐름과의 변화도 함께 비교해드릴게요."
        }
      : {
          summary:
            recentFocus.mood === (olderMoods[0]?.name ?? "")
              ? `이전 흐름과 비교하면 ${recentFocus.mood}의 결이 계속 이어지고 있어요.`
              : `이전 흐름과 비교하면 ${olderMoods[0]?.name ?? "희미한 결"}에서 ${recentFocus.mood} 쪽으로 무게가 옮겨왔어요.`
        };

  const highlightMoments =
    recentEntries.length === 0
      ? ["최근 꿈 한 편이 쌓이면 가장 먼저 되풀이되는 장면을 보여드릴게요."]
      : recentEntries.map((entry) => {
          const mood = entry.moodTags[0] ?? "여운";
          const symbol = getSymbolLabel(entry.symbolTags[0] ?? "mist");
          return `${entry.title ?? "이름 없는 꿈"}에서는 ${mood}과 ${symbol}의 장면이 먼저 떠올라요.`;
        });

  const insight =
    entries.length === 0
      ? "아직 충분한 꿈 기록이 없어요. 두세 개만 더 쌓여도 무의식의 반복 패턴이 보이기 시작해요."
      : `${recentFocus.summary} ${comparison.summary}`;

  return {
    topMoods,
    topSymbols,
    insight,
    recentFocus,
    comparison,
    highlightMoments
  };
}
