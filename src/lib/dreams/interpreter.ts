import { getSymbolLabel, getSymbolMeaning } from "@/lib/dreams/catalog";
import type { AnalysisResult } from "@/lib/dreams/types";

const symbolLibrary: Array<{ needle: RegExp; name: string }> = [
  { needle: /물|바다|호수|파도/, name: "water" },
  { needle: /학교|교실|시험|복도/, name: "school" },
  { needle: /집|방/, name: "house" },
  { needle: /창문|문/, name: "door" },
  { needle: /하늘|날아|공중|별|달/, name: "sky" },
  { needle: /도망|쫓|놓치|늦/, name: "chase" }
];

export function extractInterpretation(dreamText: string, moodTags: string[] = []): AnalysisResult {
  const lowered = dreamText.toLowerCase();
  const matchedSymbols = symbolLibrary.filter((entry) => entry.needle.test(lowered));
  const symbols =
    matchedSymbols.length > 0
      ? matchedSymbols.map(({ name }) => ({ name, label: getSymbolLabel(name), meaning: getSymbolMeaning(name) }))
      : [{ name: "mist", label: getSymbolLabel("mist"), meaning: getSymbolMeaning("mist") }];

  const mood =
    moodTags[0] ??
    (/(불안|무섭|쫓|늦)/.test(lowered) ? "불안" : /(따뜻|빛|포근|평화)/.test(lowered) ? "안도" : "여운");

  const dominantScene =
    dreamText
      .split(/[.!?\n]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] ?? dreamText;

  const emotionalSummary =
    mood === "불안"
      ? "쫓기거나 놓치고 싶지 않은 마음이 꿈의 장면 전체에 번지고 있어요."
      : mood === "안도"
        ? "부드러운 안정감과 돌아가고 싶은 감정이 잔잔하게 남아 있어요."
        : "또렷하게 설명되진 않지만 마음속에서 오래 남는 잔상이 느껴져요.";

  const currentStateReflection =
    matchedSymbols.some((entry) => entry.name === "chase")
      ? "요즘 중요한 타이밍을 놓치고 싶지 않은 마음이 무의식에 스며든 것일 수 있어요."
      : matchedSymbols.some((entry) => entry.name === "water")
        ? "정리되지 않은 감정이 깊은 곳에서 천천히 올라오는 시기일지도 몰라요."
        : "최근 마음속에서 아직 이름 붙지 않은 생각이 조용히 커지고 있는 것 같아요.";

  const symbolLabels = symbols.map((symbol) => symbol.label);
  const interpretation =
    `이 꿈은 "${dominantScene}" 장면을 통해 지금의 마음을 비추는 리딩처럼 보여요. ` +
    `상징으로는 ${symbolLabels.join(", ")}의 기운이 읽히고, ` +
    "지금 당신은 설명보다 감각으로 먼저 반응하는 시기를 지나고 있을 수 있어요.";

  return {
    interpretation,
    emotionalSummary,
    currentStateReflection,
    dominantScene,
    sceneSummary: `"${dominantScene}" 장면이 오늘 꿈의 중심에 가장 또렷하게 남아 있어요.`,
    scenePrompt: `Dreamy editorial illustration, moonlit haze, soft surreal watercolor, ${dominantScene}`,
    symbols
  };
}
