# Strata Web Visual — 최적화 상세 기록

원본: [strata-web-visual](https://github.com/iammuygeatmik5023/strata-web-visual)  
최적화 목표: GPU 점유율 100% → 40% 내외, CPU 온도 감소

---

## 목차

1. [최적화 요약](#최적화-요약)
2. [1. FPS 캡 + 적응형 프레임레이트](#1-fps-캡--적응형-프레임레이트)
3. [2. renderScale 범위 확장](#2-renderscale-범위-확장)
4. [3. sampleAccum 텍스처 샘플 수 감소](#3-sampleaccum-텍스처-샘플-수-감소)
5. [4. 유니폼 버퍼 사전 할당](#4-유니폼-버퍼-사전-할당)
6. [5. DOM 업데이트 스로틀링](#5-dom-업데이트-스로틀링)
7. [6. 매 프레임 DOM 읽기 제거](#6-매-프레임-dom-읽기-제거)
8. [되돌린 항목](#되돌린-항목)
9. [최적화 전후 비교](#최적화-전후-비교)

---

## 최적화 요약

| # | 항목 | 파일 위치 | GPU 영향 | CPU 영향 |
|---|------|----------|---------|---------|
| 1 | FPS 캡 30fps + 유휴 10fps | `app.js` `_loop()` | ★★★ | ★★★ |
| 2 | renderScale 기본값 1.0 → 0.6 | `app.js` 상단 상수 | ★★★ | - |
| 3 | sampleAccum 9샘플 → 5샘플 | `app.js` COMPOSITE_FRAG | ★★ | - |
| 4 | Float32Array 사전 할당 | `app.js` StrataScheduler | - | ★★ |
| 5 | DOM 텍스트/레인 UI 스로틀 | `app.js` `_loop()` | - | ★★ |
| 6 | per-frame DOM 읽기 제거 | `app.js` `_loop()` | - | ★★ |

---

## 1. FPS 캡 + 적응형 프레임레이트

### 문제
원본 코드는 `requestAnimationFrame`을 무제한으로 실행하여 모니터 주사율(60Hz, 120Hz)만큼 매 프레임 전체 렌더링 파이프라인을 실행했습니다.

```js
// 원본: 무제한 60fps
_loop(nowMs) {
  const wallTime = nowMs * 0.001;
  // ... 렌더링 ...
  requestAnimationFrame((t) => this._loop(t)); // 브레이크 없음
}
```

### 수정
- **30fps 캡**: 매 프레임 33ms 미만이면 렌더를 건너뜀
- **유휴 모드 10fps**: 활성 파티클이 0개이고 오디오 입력이 꺼진 상태에서는 자동으로 10fps로 전환
- `requestAnimationFrame`은 루프 최상단에서 즉시 예약하여 스케줄 지터 최소화

```js
// 수정 후
_loop(nowMs) {
  requestAnimationFrame((t) => this._loop(t)); // 항상 예약, 렌더는 조건부

  const isIdle = this.scheduler.events.length === 0 && this.inputMode !== "sound";
  const targetFps = isIdle ? 10 : 30;
  const frameBudget = 1000 / targetFps;
  if (nowMs - this._lastFrameMs < frameBudget * 0.9) return; // 이 프레임 스킵
  this._lastFrameMs = nowMs;

  // ... 이후 렌더링 코드 ...
}
```

### 효과
- GPU/CPU 부하 **최대 50% 즉시 감소**
- 유휴 시 추가 67% 감소 (30fps → 10fps)

---

## 2. renderScale 범위 확장

### 문제
누적 텍스처(accumulation framebuffer)의 해상도는 `renderScale` 값으로 결정됩니다.  
원본은 최솟값이 `1.0`으로 고정되어 있어 항상 캔버스 전체 해상도로 렌더링했습니다.  
예를 들어 2560×1600 디스플레이(Retina)에서 renderScale=1.0이면 약 400만 픽셀을 매 프레임 두 번(plate pass + composite pass) 계산합니다.

```js
// 원본
renderScale: 1.0,           // 기본값
renderScale: [1.0, 2.2],    // 범위 (최솟값 1.0)
```

### 수정
- 기본값을 `1.0 → 0.6`으로 낮춤
- 범위 최솟값을 `1.0 → 0.25`로 확장 (슬라이더로 더 낮출 수 있음)

```js
// 수정 후
renderScale: 0.6,           // 기본값
renderScale: [0.25, 2.2],   // 범위
```

### 효과
renderScale = 0.6 기준:
- 누적 텍스처 면적 = 0.6² = **전체의 36%**
- 셰이더가 처리하는 픽셀 수 **64% 감소**
- 화면 출력(composite pass)은 항상 캔버스 전체 해상도이므로 시각 품질 큰 차이 없음

---

## 3. sampleAccum 텍스처 샘플 수 감소

### 문제
`COMPOSITE_FRAG` 셰이더 안의 `sampleAccum()` 함수는 블러 효과를 위해 중심 + 8방향 = **9개의 텍스처 샘플**을 수행합니다.  
이 함수는 한 프레임 안에서 **3번** 호출됩니다 (일반 블러, 블룸, fracture).  
= 픽셀당 **최대 27번의 텍스처 페치**

```glsl
// 원본: 9샘플
vec4 sampleAccum(vec2 uv, float spread) {
  vec2 texel = 1.0 / u_accum_resolution;
  vec2 o = texel * spread;
  vec4 c = texture(u_accum_tex, uv) * 0.24;
  c += texture(u_accum_tex, uv + o * vec2(-0.8, -0.8)) * 0.095; // ↖
  c += texture(u_accum_tex, uv + o * vec2( 0.8, -0.8)) * 0.095; // ↗
  c += texture(u_accum_tex, uv + o * vec2(-0.8,  0.8)) * 0.095; // ↙
  c += texture(u_accum_tex, uv + o * vec2( 0.8,  0.8)) * 0.095; // ↘
  c += texture(u_accum_tex, uv + o * vec2(-1.7,  0.0)) * 0.095; // ←
  c += texture(u_accum_tex, uv + o * vec2( 1.7,  0.0)) * 0.095; // →
  c += texture(u_accum_tex, uv + o * vec2( 0.0, -1.7)) * 0.095; // ↑
  c += texture(u_accum_tex, uv + o * vec2( 0.0,  1.7)) * 0.095; // ↓
  return c;
}
```

### 수정
대각선 4방향을 제거하고 중심 + 십자 4방향 = **5샘플**로 변경.  
가중치를 재조정하여 합이 1.0이 되도록 유지.

```glsl
// 수정 후: 5샘플
vec4 sampleAccum(vec2 uv, float spread) {
  vec2 o = spread / u_accum_resolution;
  vec4 c = texture(u_accum_tex, uv) * 0.36;
  c += texture(u_accum_tex, uv + vec2( o.x,  0.0)) * 0.16; // →
  c += texture(u_accum_tex, uv + vec2(-o.x,  0.0)) * 0.16; // ←
  c += texture(u_accum_tex, uv + vec2( 0.0,  o.y)) * 0.16; // ↑
  c += texture(u_accum_tex, uv + vec2( 0.0, -o.y)) * 0.16; // ↓
  return c;
}
```

### 효과
- 텍스처 페치: 27회 → **15회** (44% 감소)
- 블러 품질 변화는 육안으로 거의 구분 불가

---

## 4. 유니폼 버퍼 사전 할당

### 문제
`packUniformArrays()`는 GPU에 파티클 데이터를 업로드하기 위해 매 프레임 `Float32Array`를 **3개 새로 생성**합니다.  
(MAX_PLATES × 4 floats × 3개 = 768개의 float = 약 3KB)

```js
// 원본: 매 프레임 3개의 배열 새로 할당
packUniformArrays() {
  const data0 = new Float32Array(MAX_PLATES * 4); // ← 매번 GC 대상
  const data1 = new Float32Array(MAX_PLATES * 4); // ← 매번 GC 대상
  const data2 = new Float32Array(MAX_PLATES * 4); // ← 매번 GC 대상
  // ...
  return { count, data0, data1, data2 };
}
```

30fps 기준 초당 90개의 Float32Array 생성 → GC(가비지 컬렉션) 주기적 발생 → CPU 스파이크

### 수정
`StrataScheduler` 생성자에서 버퍼를 **한 번만 할당**하고 재사용합니다.

```js
// 생성자에서 1회 할당
constructor(width, height) {
  // ...
  this._uniData0 = new Float32Array(MAX_PLATES * 4);
  this._uniData1 = new Float32Array(MAX_PLATES * 4);
  this._uniData2 = new Float32Array(MAX_PLATES * 4);
  this._uniPacked = { count: 0, data0: this._uniData0, data1: this._uniData1, data2: this._uniData2 };
  this._enabledIdx = []; // 이벤트 인덱스 버퍼도 재사용
}

// 매 프레임 기존 버퍼를 덮어씀 (new 없음)
packUniformArrays() {
  const data0 = this._uniData0; // 기존 배열 재사용
  const data1 = this._uniData1;
  const data2 = this._uniData2;
  // ... 값만 업데이트 ...
  this._uniPacked.count = count;
  return this._uniPacked;
}
```

### 효과
- 매 프레임 GC 대상 객체 **0개** (기존 3개)
- GC로 인한 CPU 스파이크 제거
- `filter()`로 인한 임시 배열 생성도 `_enabledIdx` 재사용으로 제거

---

## 5. DOM 업데이트 스로틀링

### 문제
`_loop()`에서 매 프레임 두 가지 DOM 업데이트가 실행됩니다.

**① 런타임 텍스트** (`_updateRuntimeText`): 12줄 문자열을 `join()`하여 `textContent`에 씀  
**② 오디오 레인 UI** (`_updateAudioLaneUI`): 레벨 미터, 수치 텍스트 등 DOM 다수 업데이트

원본에서는 이 두 가지가 **60fps(초당 60회)** 실행됩니다.  
사람 눈이 텍스트 업데이트를 인지하는 속도는 5~10Hz면 충분합니다.

### 수정
타임스탬프를 추적하여 각각 독립적으로 스로틀링 적용

```js
// 생성자에 타이머 추가
this._lastLaneUiMs = 0;
this._lastRuntimeTextMs = 0;

// _loop에서 조건부 실행
if (nowMs - this._lastLaneUiMs > 66) {       // ~15Hz
  this._updateAudioLaneUI(...);
  this._lastLaneUiMs = nowMs;
}

if (nowMs - this._lastRuntimeTextMs > 200) {  // ~5Hz
  this._updateRuntimeText();
  this._lastRuntimeTextMs = nowMs;
}
```

### 효과

| 항목 | 원본 | 수정 후 |
|------|-----|--------|
| 런타임 텍스트 DOM 쓰기 | 60회/sec | 5회/sec (-92%) |
| 레인 UI DOM 업데이트 | 60회/sec | 15회/sec (-75%) |

---

## 6. 매 프레임 DOM 읽기 제거

### 문제
`_syncEffectStateFromUI()`는 11개 이펙트 × 3개 컨트롤(체크박스, amount, speed) = **매 프레임 33회의 DOM 읽기**를 수행합니다.

```js
// 원본: 매 프레임 _loop에서 호출
_loop(nowMs) {
  this._syncEffectStateFromUI(); // ← 33회 DOM 읽기
  // ...
}

_syncEffectStateFromUI() {
  for (const key of EFFECT_TOGGLE_KEYS) { // 11개 이펙트
    const checkbox = this.effectCheckboxes[key];
    if (checkbox) this.scheduler.setEffectEnabled(key, !!checkbox.checked); // DOM 읽기
    const amountSlider = this.effectAmountSliders[key];
    if (amountSlider) this.scheduler.setEffectAmount(key, Number(amountSlider.value)); // DOM 읽기
    const speedSlider = this.effectSpeedSliders[key];
    if (speedSlider) this.scheduler.setEffectSpeed(key, Number(speedSlider.value)); // DOM 읽기
  }
}
```

### 분석
원본 코드를 확인한 결과, 각 슬라이더/체크박스에는 **이미 `input`/`change` 이벤트 리스너**가 등록되어 있었습니다.

```js
// _bindUI 안에 이미 존재
input.addEventListener("change", () => {
  this.scheduler.setEffectEnabled(key, input.checked); // 변경 시 즉시 반영
});
amountInput.addEventListener("input", () => {
  this.scheduler.setEffectAmount(key, v); // 변경 시 즉시 반영
});
speedInput.addEventListener("input", () => {
  this.scheduler.setEffectSpeed(key, v); // 변경 시 즉시 반영
});
```

즉, `_syncEffectStateFromUI()`는 이미 이벤트 기반으로 동기화되는 값을 **불필요하게 매 프레임 재확인**하는 중복 코드였습니다.

### 수정
`_loop()`에서 `_syncEffectStateFromUI()` 호출을 완전히 제거했습니다.  
이벤트 리스너가 값 변경을 즉시 반영하므로 동작에 변화 없음.

### 효과
- 매 프레임 33회 DOM 읽기 → **0회**
- 30fps 기준 초당 990회 DOM 접근 제거

---

## 되돌린 항목

### Paper noise 텍스처 베이킹 (시도 후 롤백)

**시도 내용**: `COMPOSITE_FRAG` 셰이더 안에서 매 픽셀마다 실행되는 `noise21()` 함수(총 5회 이상 호출)를 사전에 CPU에서 계산해 256×256 RGBA 텍스처로 굽고, 셰이더에서는 텍스처 1회 샘플링으로 대체하려 했습니다.

**예상 효과**: 픽셀당 noise 연산 약 14회 hash12 호출 → 텍스처 샘플 2회

**문제**: 
- 원본 noise는 `v_uv * u_resolution * 1.22` 주파수로 계산 (픽셀 단위 고주파)
- 256×256 텍스처를 화면에 반복 샘플링하면 주파수 특성이 달라짐
- LINEAR 필터링으로 노이즈가 부드럽게 보간되어 **종이 거친 질감이 사라짐**
- 사용자가 시각 품질 차이를 명확히 인지

**결정**: 완전 롤백. 셰이더 내 원본 noise 연산 유지.

---

## 최적화 전후 비교

### GPU 부하

| 항목 | 원본 | 최적화 |
|------|-----|--------|
| 렌더링 FPS | 60fps (무제한) | 30fps (유휴 10fps) |
| 누적 텍스처 픽셀 수 | 100% | 36% (renderScale 0.6) |
| 텍스처 페치/픽셀 | ~27회 | ~15회 |
| **총 GPU 작업량** | **100%** | **약 25~40%** |

### CPU 부하

| 항목 | 원본 (60fps) | 최적화 (30fps) |
|------|------------|--------------|
| Float32Array 생성 | 180개/sec | 0개/sec |
| 런타임 텍스트 DOM 쓰기 | 60회/sec | 5회/sec |
| 레인 UI DOM 쓰기 | 60회/sec | 15회/sec |
| 슬라이더 DOM 읽기 | 1980회/sec | 0회/sec |
| **총 JS 실행 횟수** | **60회/sec** | **30회/sec** |

### 체감 효과
- GPU 온도/점유율 감소
- CPU 온도 감소 (DOM 조작, GC 스파이크 제거)
- 시각 품질 변화 없음 (paper 질감 원본 유지)
- 유휴 상태(파티클 0 + 오디오 OFF)에서 소비전력 대폭 절감
