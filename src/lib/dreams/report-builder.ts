export type ReportInput = {
  moodTags: string[];
  symbolTags: string[];
};

function rank(values: string[]) {
  return [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function buildDreamReport(entries: ReportInput[]) {
  const topMoods = rank(entries.flatMap((entry) => entry.moodTags));
  const topSymbols = rank(entries.flatMap((entry) => entry.symbolTags));

  const insight =
    entries.length === 0
      ? "아직 충분한 꿈 기록이 없어요. 두세 개만 더 쌓여도 무의식의 반복 패턴이 보이기 시작해요."
      : `최근 기록에서는 ${topMoods[0]?.name ?? "설명하기 어려운 감정"}의 흐름과 ` +
        `${topSymbols[0]?.name ?? "희미한 상징"} 이미지가 반복되고 있어요.`;

  return {
    topMoods,
    topSymbols,
    insight
  };
}
