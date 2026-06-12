# DreamFold Harness Engineering Guide

## Purpose

이 문서는 DreamFold에서 에이전트가 코드, 테스트, 런타임 하네스, 검증 흐름을 건드릴 때 따라야 하는 상세 playbook이다.  
`AGENTS.md`가 짧은 운영 규칙이라면, 이 문서는 그 규칙이 왜 필요한지와 어떤 순서로 적용해야 하는지를 설명한다.

이 문서는 두 가지를 합쳐 만든다.

- DreamFold 작업 중 실제로 발생한 하네스 실패와 검증 회귀
- `agent-harness-playbook`의 phase/gate/review 관점

목표는 테스트를 “돌리는 것”이 아니라, 항상 같은 조건에서 믿을 수 있게 돌리도록 강제하는 것이다.

## Core Loop

```text
scope discovery
-> plan acceptance criteria and non-goals
-> branch/worktree preflight
-> implementation
-> test update at the right layer
-> focused verification
-> integration or harness check
-> fresh review
-> fix findings and repeat
-> commit / push / PR handoff
```

## Phase And Gate Order

1. Scope discovery  
   현재 파일, 명령, 실행 경로를 먼저 확인한다. 하네스 변경은 추측으로 시작하면 안 된다.

2. Acceptance criteria and non-goals  
   이번 변경이 보장해야 할 계약과, 건드리지 말아야 할 동작을 적는다.

3. Branch/worktree preflight  
   현재 브랜치, upstream, dirty state, 생성물 파일을 먼저 확인한다.

4. Implementation  
   기존 helper와 로컬 패턴을 우선 사용한다. 하네스는 새 추상화보다 실행 ownership을 명확히 하는 편이 중요하다.

5. Test update  
   바뀐 계층에 맞는 테스트를 추가한다. helper만 바뀌어도 page/E2E 확인이 필요한 경우가 많다.

6. Focused verification  
   가장 작은 명령으로 변경 계약을 먼저 증명한다.

7. Integration or harness check  
   서버 실행, 외부 API, local persistence, wrapper cleanup처럼 경계를 넘는 동작은 통합 검증까지 확인한다.

8. Fresh review  
   findings-first 리뷰를 받고, actionable finding은 전부 반영한다.

9. Fix / rerun / repeat  
   수정 후 관련 검증을 다시 돌리고, 새 리뷰 패스로 넘긴다.

## Planning Checklist

변경 전에 최소한 아래를 정리한다.

- 사용자 요청과 acceptance criteria
- 이번 변경의 non-goals
- 건드릴 파일과 건드리지 말아야 할 파일
- dry-run 또는 isolated run에서 절대 발생하면 안 되는 side effect
- 공유 상태 파일이나 로컬 데이터 경로
- 필요한 검증 명령
- 실패 시 rollback point

## DreamFold Harness Rules

### 1. Harness owns runtime

- 하네스는 포트, 데이터 디렉터리, 시드 데이터 여부, 서버 lifecycle을 직접 소유해야 한다.
- 기존 로컬 서버 재사용보다 wrapper가 직접 서버를 띄우고 정리하는 방식을 우선한다.
- 정적 설정 파일은 runtime allocator가 아니라 config consumer여야 한다.

DreamFold 기준:

- 공식 E2E 진입점은 `npm run test:e2e`
- `scripts/run-playwright.mjs`가 port/data dir/server lifecycle을 소유
- `scripts/run-playwright.mjs`가 `DREAMFOLD_ENABLE_SEED_DATA=1`도 함께 주입
- `playwright.config.ts`는 wrapper가 넘긴 `PLAYWRIGHT_BASE_URL`만 읽는다

### 2. No fixed shared port

- `3000`, `3100` 같은 포트를 고정하면 로컬 개발 서버와 충돌한다.
- 포트는 실행마다 고르고, 같은 값을 서버와 브라우저 테스트 모두에 전달해야 한다.
- 포트 선택은 한 번만 일어나야 한다. 각 프로세스가 다시 계산하면 안 된다.

DreamFold 기준:

- wrapper가 free port를 한 번 선택
- wrapper가 그 포트로 `next dev`를 직접 실행
- wrapper가 Playwright child에 `PLAYWRIGHT_BASE_URL` env를 전달

### 3. No shared local persistence in E2E

- E2E가 실제 `.dreamfold-data`를 공유하면 테스트 run끼리 서로 오염된다.
- E2E는 per-run temp directory를 받아야 한다.
- 앱 코드는 env override를 통해 저장 경로를 바꿀 수 있어야 한다.

DreamFold 기준:

- `src/lib/dreams/store-path.ts`가 저장 경로를 계산
- `DREAMFOLD_DATA_DIR`가 있으면 그 값을 우선 사용
- E2E wrapper는 temp dir를 만들고 env로 주입

### 4. Cleanup must be guaranteed on the normal wrapper path

- temp dir를 만든 만큼 정상 wrapper 종료 경로에서는 cleanup이 강제되어야 한다.
- `process.exit()`를 잘못 쓰면 `finally` cleanup이 건너뛰어질 수 있다.
- 부모 프로세스만 죽이고 child server가 남는 구조도 피해야 한다.
- 종료 신호 후에는 실제 exit를 기다린 뒤 파일 정리를 한다.

DreamFold 기준:

- wrapper는 `process.exitCode = await main()` 패턴 사용
- `finally`에서 server shutdown -> exit wait -> temp dir delete 순서 유지
- `npm run dev` wrapper 대신 실제 `next` binary를 직접 spawn

현재 DreamFold 주의사항:

- 현재 문서가 보장하는 cleanup은 정상 awaited 종료 경로 기준이다.
- SIGINT/SIGTERM 같은 강제 중단까지 동일하게 harden되어 있다고 가정하면 안 된다.

### 5. Center validation on the final chosen input

- `dreamText`와 `voiceTranscript`처럼 서로 대체 가능한 필드는 최종 저장 텍스트를 먼저 고르고, 그 값에 비즈니스 검증을 적용하는 방향이 맞다.
- raw 단계 검증이 남아 있더라도, 새 변경은 최종 입력 기준 계약을 약화시키지 않는 쪽으로 가야 한다.
- 이상적으로는 선택되지 않는 stale field가 유효한 최종 제출을 막지 않는 상태를 목표로 삼는다.

DreamFold 기준:

- `createDreamSchema`는 raw payload shape를 우선 정리하지만, 현재는 `voiceTranscript` 같은 일부 raw field upper bound도 함께 가진다
- `resolveCreateDreamInput()`이 최종 저장 텍스트를 결정
- 최종 텍스트에 길이/유효성 규칙 적용

현재 DreamFold 주의사항:

- 현재 구현은 최종 텍스트를 기준으로 핵심 검증을 적용하지만, raw field별 upper bound는 일부 남아 있다.
- 그래서 이 문서의 원칙은 “하네스/입력 계약을 더 나쁘게 만들지 말 것”과 “최종 텍스트 검증을 중심에 둘 것”으로 읽어야 한다.

입력 우선순위:

- 이미 유효한 `dreamText`가 있으면 그 값을 보존
- `dreamText`가 부족할 때만 `voiceTranscript`를 fallback으로 사용
- 현재 DreamFold에서는 사용되지 않는 raw field도 일부 upper bound 때문에 제출 실패 원인이 될 수 있다
- 그래서 이 섹션은 현재 동작 설명과 함께, 앞으로 유지해야 할 설계 목표를 분리해서 읽어야 한다

### 6. Official path must be enforced

- “wrapper가 권장” 수준이면 곧바로 우회 실행이 생긴다.
- 공식 진입점 하나를 정하고, 가능한 한 우회 실행도 명시적으로 막는다.

DreamFold 기준:

- Playwright는 `PLAYWRIGHT_BASE_URL` 없이 실행되면 실패
- 프로젝트 정책상 E2E는 `npm run test:e2e`를 공식 경로로 사용한다
- 기술적으로는 env를 수동 주입해 direct run을 우회할 수 있으므로, 문서와 리뷰에서 이 경로를 허용된 실행 방식으로 취급하지 않는다

### 7. Build/dev/e2e interference is an environment class first

- DreamFold에서는 `build`와 `dev/E2E`가 겹칠 때 간헐적인 `/_document` 오류가 발생했다.
- 이런 경우 바로 제품 코드 버그로 분류하지 말고 환경 간섭으로 먼저 본다.

운영 규칙:

- `npm run build`는 가급적 단독으로 확인
- dev/E2E 병행 중 build 실패는 재현 분리 후 판단
- “단독 실행에서도 깨지는가”를 먼저 본다

### 8. Helper tests do not close UI branch work

- 상태 helper 테스트는 필요하지만 충분하지 않다.
- empty state, fallback 제거, error branch 변경은 페이지/E2E까지 닫아야 한다.

DreamFold 기준:

- `src/lib/home-state.ts` 테스트만으로 끝내지 않는다
- `tests/e2e/smoke-home.spec.ts`에서 실제 empty-filter 렌더를 확인한다

## Verification Matrix

### Input normalization or API contract changes

- unit test for resolver/helper
- route test for API status/body
- full `npm test`

### Harness or runtime wrapper changes

- official wrapper command: `npm run test:e2e`
- if needed, run the same wrapper command with narrowed Playwright arguments instead of inventing a parallel ad hoc path
- `npm run build` standalone

### UI branch changes

- helper/state test if relevant
- rendered page or E2E assertion

### Documentation-only changes

- path validity
- command validity
- linked file existence

## Failure Classification

수정 전에 먼저 분류한다.

- `implementation bug`  
  제품 코드가 요구 계약을 만족하지 못함

- `harness bug`  
  테스트 wrapper, env wiring, startup/cleanup, runtime ownership이 잘못됨

- `test bug`  
  기대값이나 setup이 현재 계약과 맞지 않음

- `environment interference`  
  로컬 서버, 포트 충돌, 병렬 build/dev 간섭 가능성, missing secret, network blocker

- `unclear requirement`  
  안전한 기본 동작을 코드만 보고 추론할 수 없음

DreamFold에서는 이전 작업에서 `/_document` build failure처럼 하네스와 제품 코드가 섞여 보이는 증상이 관찰된 적이 있다. 이런 유형은 먼저 standalone reproduction 여부를 확인한다.

## Review Lenses

리뷰 시 아래 렌즈를 사용한다.

### Input Resolution

- competing field가 final valid submission을 막지 않는가
- edited value를 stale helper field가 덮어쓰지 않는가
- route contract와 UI flow가 같은 우선순위를 따르는가

### Harness Isolation

- per-run port가 wrapper에서 한 번만 결정되는가
- temp data dir가 shared store를 완전히 우회하는가
- cleanup이 normal exit에서 보장되는가
- official entrypoint outside path가 명시적으로 막혀 있는가

### UI Branching

- fallback 제거가 실제 렌더 결과에 반영됐는가
- helper test만 있고 page assertion이 빠진 상태는 아닌가

### Change Size And Staging

- scratch/cache/temp output이 포함되지 않았는가
- docs, harness, product behavior가 한 PR에서 과도하게 섞이지 않았는가

## Git And PR Handling

- primary branch에 직접 커밋하지 않는다.
- stage는 explicit path만 쓴다.
- generated cache, temp dir, local data는 커밋하지 않는다.
- commit 전에 최소 검증을 끝낸다.
- PR 본문에는 실제 실행한 검증 명령만 적는다.
- skipped checks가 있으면 이유를 남긴다.

DreamFold에서는 특히 아래를 PR에 적는 편이 좋다.

- `npm test`
- `npm run build`
- `npm run test:e2e`
- E2E wrapper ownership changes 여부

## DreamFold-Specific Pitfalls

### Pitfall: raw validation moved but still blocks final input

문제 패턴:

- `min` 문제를 고친 뒤 `max`가 같은 방식으로 남아 다시 pre-resolution rejection을 일으킴
- 최종 선택 로직이 맞더라도 raw schema upper bound가 먼저 막아 current behavior와 intended behavior가 다시 벌어짐

예방 규칙:

- raw schema는 shape normalization 위주로 유지하려고 시도
- current behavior를 문서화할 때는 남아 있는 pre-resolution guard도 같이 적는다
- final schema는 chosen text 중심으로 강화한다

### Pitfall: dynamic port chosen in config, not in wrapper

문제 패턴:

- Playwright config가 프로세스마다 다시 평가되며 서로 다른 포트를 사용

예방 규칙:

- 포트는 wrapper가 한 번만 정하고 env로 전달

### Pitfall: cleanup code exists but never actually runs

문제 패턴:

- `process.exit()`가 `finally`를 우회

예방 규칙:

- return code를 상위로 올리고 `process.exitCode`만 설정

### Pitfall: parent process dies but child server survives

문제 패턴:

- `npm` wrapper만 kill해서 실제 app server tree가 남음

예방 규칙:

- 실제 app binary를 직접 spawn
- shutdown 후 exit wait까지 수행

## Recommended Verification Order

1. `npm test`
2. `npm run build`
3. `npm run test:e2e`

주의:

- `build`와 `test:e2e`는 동시에 돌리지 않는 편이 낫다
- 하네스 변경 후에는 최소 한 번 전체 E2E를 다시 돌린다

## One-Line Rule

하네스는 테스트를 실행해주는 편의 코드가 아니라, 테스트가 항상 같은 계약과 같은 고립 조건에서만 실행되도록 강제하는 제어 코드여야 한다.
