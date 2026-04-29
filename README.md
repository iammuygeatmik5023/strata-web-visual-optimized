# Strata Web Visual — Optimized

> 원본 프로젝트 [strata-web-visual](https://github.com/iammuygeatmik5023/strata-web-visual)의 GPU/CPU 최적화 빌드입니다.

**WebGL2 기반 음악 반응형 흑백 비주얼 인스트루먼트**  
마이크 입력 또는 내장 랜덤 리듬으로 실시간 파티클 비주얼을 생성하며, 종이/먹물 질감의 미학을 추구합니다.

---

## 실행 방법

별도 빌드 과정 없이 정적 파일 서버로 바로 실행 가능합니다.

```bash
# Python (설치 불필요)
python3 -m http.server 4173

# 또는 Node.js
npx serve . -p 4173
```

브라우저에서 `http://localhost:4173` 접속

---

## 원본 대비 최적화 내용

| 항목 | 원본 | 최적화 |
|------|-----|--------|
| 렌더링 FPS | 60fps 무제한 | 30fps (유휴 시 10fps 자동 전환) |
| 누적 텍스처 픽셀 수 | 100% | 36% (renderScale 기본값 0.6) |
| renderScale 범위 | 1.0 ~ 2.2 | **0.25 ~ 2.2** |
| 텍스처 샘플/픽셀 | ~27회 | ~15회 |
| Float32Array 할당 | 매 프레임 3개 생성 | 0 (사전 할당 재사용) |
| DOM 텍스트 업데이트 | 60회/sec | 5회/sec |
| DOM 슬라이더 읽기 | 1980회/sec | 0회/sec |

**예상 GPU 점유율**: 100% → 35~45%  
**예상 CPU 온도**: 대폭 감소

자세한 내용은 [OPTIMIZATION.md](./OPTIMIZATION.md) 참고

---

## 기술 스택

- **렌더링**: WebGL2 (2-Pass 셰이더 파이프라인)
- **오디오**: Web Audio API (FFT 기반 킥/스네어/하이햇 감지)
- **외부 라이브러리**: 없음 (순수 Vanilla JS)
- **배포**: 정적 파일 (별도 빌드 불필요)

## 주요 기능

- **11가지 파티클 이펙트**: Bloom, Void, Ring, Stack, Bokeh, Thermal, Drip, Frame, Shear, Fiber, Dust
- **2가지 반응 모드**: Classic Reactive / Fracture Sync (글리치)
- **2가지 입력 모드**: 내장 랜덤 리듬 / 마이크 사운드 입력
- **5가지 컬러 팔레트** + 사용자 커스텀 프리셋 (LocalStorage 저장)
- **시각 파라미터 실시간 조정**: Contrast, Paper Grain, Exposure, Bloom, Blur 등

---

## 파일 구조

```
strata-web-visual-optimized/
├── app.js            ← 핵심 로직 (스케줄러 + 셰이더 + 렌더러)
├── index.html        ← UI 레이아웃
├── styles.css        ← 스타일
├── OPTIMIZATION.md   ← 최적화 상세 기록
└── README.md
```
