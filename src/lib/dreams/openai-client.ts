import { analysisResponseJsonSchema, analysisResponseSchema } from "@/lib/dreams/ai-schema";
import { normalizeSymbolCode, symbolCodes } from "@/lib/dreams/catalog";
import type { AnalysisResult } from "@/lib/dreams/types";

type GenerateDreamAnalysisInput = {
  dreamText: string;
  moodTags: string[];
};

type DreamImageResult = {
  imageBase64: string;
  revisedPrompt: string;
};

type OpenAIResponsePayload = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
  output?: Array<{
    type?: string;
    refusal?: string;
    revised_prompt?: string;
    result?: string;
    content?: Array<{
      type?: string;
      text?: string;
        refusal?: string;
      }>;
    }>;
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
  }>;
};

function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API 키가 설정되지 않았어요.");
  }

  return apiKey;
}

function resolveTextModel() {
  return process.env.OPENAI_TEXT_MODEL ?? "gpt-5.5";
}

function resolveImageModel() {
  return process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
}

const OPENAI_REQUEST_TIMEOUT_MS = 30_000;
const OPENAI_IMAGE_REQUEST_TIMEOUT_MS = 120_000;

async function callOpenAI(
  pathname: string,
  body: unknown,
  fallbackMessage: string,
  moderationMessage = fallbackMessage,
  timeoutMs = OPENAI_REQUEST_TIMEOUT_MS
) {
  const apiKey = requireApiKey();
  let response: Response;

  try {
    response = await fetch(`https://api.openai.com/v1${pathname}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch {
    throw new Error(fallbackMessage);
  }

  let payload: OpenAIResponsePayload;

  try {
    payload = (await response.json()) as OpenAIResponsePayload;
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    const errorCode = payload.error?.code;
    const errorType = payload.error?.type;
    const errorMessage = payload.error?.message?.toLowerCase() ?? "";

    if (errorCode === "moderation_blocked" || errorType === "image_generation_user_error") {
      throw new Error(moderationMessage);
    }

    if (response.status === 401 || errorCode === "invalid_api_key") {
      throw new Error("OpenAI 인증에 실패했어요. API 키를 확인해 주세요.");
    }

    if (
      response.status === 403 ||
      errorCode === "organization_verification_required" ||
      errorMessage.includes("organization verification")
    ) {
      throw new Error("OpenAI 조직 인증이나 프로젝트 권한이 필요해요. 플랫폼 설정을 확인해 주세요.");
    }

    if (errorCode === "insufficient_quota" || errorCode === "billing_hard_limit_reached") {
      throw new Error("OpenAI 사용 한도에 도달했어요. 프로젝트 결제와 사용량을 확인해 주세요.");
    }

    if (response.status === 429) {
      throw new Error("OpenAI 요청이 잠시 제한되었어요. 조금 뒤에 다시 시도해 주세요.");
    }

    throw new Error(fallbackMessage);
  }

  return payload;
}

function hasKoreanText(message: string) {
  return /[가-힣]/.test(message);
}

function extractOutputText(payload: OpenAIResponsePayload) {
  const content = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && item.text);

  if (!content?.text) {
    throw new Error("OpenAI 해몽 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return content.text;
}

function extractRefusal(payload: OpenAIResponsePayload) {
  const refusal =
    payload.output?.find((item) => item.refusal)?.refusal ??
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "refusal" || item.refusal)
      ?.refusal;

  return refusal && hasKoreanText(refusal) ? refusal : refusal ? "안전 정책 때문에 해몽을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요." : null;
}

function normalizeAnalysisSymbols(analysis: AnalysisResult): AnalysisResult {
  return {
    ...analysis,
    symbols: analysis.symbols.map((symbol) => ({
      ...symbol,
      name: normalizeSymbolCode(symbol.name)
    }))
  };
}

export function parseAnalysisPayload(payload: unknown): AnalysisResult {
  return analysisResponseSchema.parse(payload);
}

export async function generateDreamAnalysis(input: GenerateDreamAnalysisInput): Promise<AnalysisResult> {
  const moodLine = input.moodTags.length > 0 ? input.moodTags.join(", ") : "없음";
  const payload = await callOpenAI("/responses", {
    model: resolveTextModel(),
    reasoning: {
      effort: "low"
    },
    text: {
      format: {
        type: "json_schema",
        name: "dream_analysis",
        schema: analysisResponseJsonSchema,
        strict: true
      }
    },
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "당신은 한국어로 답하는 DreamFold의 해몽 리더입니다. 문체는 부드럽고 상징적이어야 하지만 단정적이거나 진단적이면 안 됩니다. 의료, 치료, 정신질환 진단처럼 들리는 표현은 금지입니다. 항상 JSON 스키마만 반환하세요."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `꿈 원문:\n${input.dreamText}\n\n` +
              `선택한 감정 태그: ${moodLine}\n\n` +
              `해몽에는 가장 선명한 장면, 감정의 결, 현재 상태에 대한 조심스러운 반영, 상징 목록, 그리고 이후 그림 생성을 위한 짧은 영어 scenePrompt를 포함하세요. symbols[].name은 반드시 다음 코드 중 하나만 사용하세요: ${symbolCodes.join(", ")}.`
          }
        ]
      }
    ]
  }, "해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", "안전 정책 때문에 해몽을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요.");

  const refusal = extractRefusal(payload);
  if (refusal) {
    throw new Error(refusal);
  }

  try {
    const outputText = extractOutputText(payload);
    return {
      ...normalizeAnalysisSymbols(parseAnalysisPayload(JSON.parse(outputText))),
      source: "openai"
    };
  } catch {
    throw new Error("해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

export async function generateDreamSceneImage(prompt: string): Promise<DreamImageResult> {
  const payload = await callOpenAI("/images/generations", {
    model: resolveImageModel(),
    prompt,
    size: "1024x1024",
    quality: "medium"
  }, "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.", "안전 정책 때문에 그림을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요.", OPENAI_IMAGE_REQUEST_TIMEOUT_MS);

  const image = payload.data?.[0]?.b64_json;
  if (!image) {
    throw new Error("꿈 장면 이미지를 받지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return {
    imageBase64: image,
    revisedPrompt: payload.data?.[0]?.revised_prompt ?? prompt
  };
}
