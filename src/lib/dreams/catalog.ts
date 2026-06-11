const symbolCatalog: Record<string, { label: string; meaning: string }> = {
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

export function getSymbolLabel(code: string) {
  return symbolCatalog[code]?.label ?? code;
}

export function getSymbolMeaning(code: string) {
  return symbolCatalog[code]?.meaning ?? "아직 또렷하게 풀리지 않은 상징";
}

export function formatSymbolLabels(symbols: string[]) {
  return symbols.map(getSymbolLabel).join(", ");
}
