export const symbolCodes = ["water", "school", "house", "door", "sky", "chase", "mist"] as const;

type SymbolCode = (typeof symbolCodes)[number];

const symbolCatalog: Record<SymbolCode, { label: string; meaning: string }> = {
  water: {
    label: "물",
    meaning: "감정의 깊이와 아직 다 풀리지 않은 여운"
  },
  school: {
    label: "학교",
    meaning: "성장 압박, 평가, 끝나지 않은 숙제"
  },
  house: {
    label: "집",
    meaning: "안쪽의 나, 익숙함, 돌아가고 싶은 감각"
  },
  door: {
    label: "문",
    meaning: "경계, 선택, 닫히거나 열리는 가능성"
  },
  sky: {
    label: "하늘",
    meaning: "거리감, 해방감, 멀리 두고 바라보는 마음"
  },
  chase: {
    label: "추격",
    meaning: "놓치고 싶지 않은 타이밍과 조급함"
  },
  mist: {
    label: "안개",
    meaning: "이름 붙이기 어려운 직감과 흐린 감정"
  }
};

const symbolAliases: Record<string, SymbolCode> = {
  water: "water",
  ocean: "water",
  sea: "water",
  wave: "water",
  lake: "water",
  river: "water",
  물: "water",
  바다: "water",
  파도: "water",
  house: "house",
  home: "house",
  room: "house",
  집: "house",
  방: "house",
  school: "school",
  classroom: "school",
  exam: "school",
  hallway: "school",
  corridor: "school",
  schoolhallway: "school",
  학교: "school",
  교실: "school",
  시험: "school",
  복도: "school",
  door: "door",
  gate: "door",
  gateway: "door",
  window: "door",
  문: "door",
  창문: "door",
  sky: "sky",
  moon: "sky",
  star: "sky",
  cloud: "sky",
  하늘: "sky",
  달: "sky",
  별: "sky",
  추격: "chase",
  chase: "chase",
  pursuit: "chase",
  running: "chase",
  escape: "chase",
  쫓김: "chase",
  도망: "chase",
  안개: "mist",
  mist: "mist",
  fog: "mist",
  haze: "mist"
};

function normalizeAliasKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s_/-]+/g, "");
}

export function normalizeSymbolCode(value: string): SymbolCode {
  const normalized = normalizeAliasKey(value);
  return symbolAliases[normalized] ?? "mist";
}

export function getSymbolLabel(code: string) {
  return symbolCatalog[normalizeSymbolCode(code)]?.label ?? code;
}

export function getSymbolMeaning(code: string) {
  return symbolCatalog[normalizeSymbolCode(code)]?.meaning ?? "아직 또렷하게 풀리지 않은 상징";
}

export function formatSymbolLabels(symbols: string[]) {
  return symbols.map(getSymbolLabel).join(", ");
}
