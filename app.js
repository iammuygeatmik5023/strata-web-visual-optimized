const MAX_PLATES = 64;

const KIND = {
  BLOOM: 0,
  RING: 1,
  BOKEH: 2,
  SPORE: 3,
  THERMAL: 4,
  DRIP: 5,
  FRAME: 6,
  VOID: 7,
  DUST: 8,
  SHEAR: 9,
  FIBER: 10,
};

const KIND_TO_EFFECT = Object.freeze({
  [KIND.BLOOM]: "bloom",
  [KIND.RING]: "ring",
  [KIND.BOKEH]: "bokeh",
  [KIND.SPORE]: "spore",
  [KIND.THERMAL]: "thermal",
  [KIND.DRIP]: "drip",
  [KIND.FRAME]: "frame",
  [KIND.VOID]: "void",
  [KIND.DUST]: "dust",
  [KIND.SHEAR]: "shear",
  [KIND.FIBER]: "fiber",
});

const PALETTES = {
  mono_pink: {
    ink_a: [247, 24, 128],
    ink_b: [177, 6, 104],
    accents: [[255, 150, 205], [241, 95, 176], [208, 51, 140]],
    paper_tint: [246, 242, 236],
  },
  mono_blue: {
    ink_a: [29, 108, 226],
    ink_b: [18, 66, 181],
    accents: [[176, 220, 255], [95, 170, 244], [52, 120, 224]],
    paper_tint: [242, 245, 249],
  },
  mono_red: {
    ink_a: [233, 42, 63],
    ink_b: [190, 24, 40],
    accents: [[255, 178, 164], [245, 118, 108], [222, 70, 82]],
    paper_tint: [247, 241, 238],
  },
  pastel_multi: {
    ink_a: [245, 123, 208],
    ink_b: [97, 196, 248],
    accents: [[255, 210, 89], [255, 153, 65], [130, 225, 248], [254, 176, 226], [179, 204, 255]],
    paper_tint: [241, 239, 249],
  },
  thermal: {
    ink_a: [87, 230, 255],
    ink_b: [242, 52, 190],
    accents: [[255, 170, 46], [69, 86, 255], [255, 121, 210], [188, 241, 255]],
    paper_tint: [245, 244, 248],
  },
};

const PRESETS = {
  "BLOOM/VOID MONO": {
    palette: "mono_pink",
    weights: { bloom: 1.0, void: 0.68, ring: 0.24, stack: 0.06, bokeh: 0.16, shear: 0.24, spore: 0.0, fiber: 0.03, thermal: 0.01, drip: 0.01, frame: 0.07, dust: 0.28 },
  },
  "RING PRINTER TOTEM": {
    palette: "mono_blue",
    weights: { bloom: 0.36, void: 0.24, ring: 1.0, stack: 0.82, bokeh: 0.14, shear: 0.22, spore: 0.0, fiber: 0.11, thermal: 0.12, drip: 0.45, frame: 0.78, dust: 0.2 },
  },
  "SPORE NETWORK": {
    palette: "mono_pink",
    weights: { bloom: 0.58, void: 0.12, ring: 0.31, stack: 0.14, bokeh: 0.16, shear: 0.42, spore: 0.0, fiber: 0.88, thermal: 0.08, drip: 0.07, frame: 0.23, dust: 0.3 },
  },
  "PASTEL BOKEH ORCHESTRA": {
    palette: "pastel_multi",
    weights: { bloom: 0.35, void: 0.08, ring: 0.35, stack: 0.16, bokeh: 1.0, shear: 0.3, spore: 0.0, fiber: 0.02, thermal: 0.12, drip: 0.08, frame: 0.12, dust: 0.45 },
  },
  "THERMAL DRIP COLUMN": {
    palette: "thermal",
    weights: { bloom: 0.2, void: 0.12, ring: 0.38, stack: 0.42, bokeh: 0.2, shear: 0.24, spore: 0.0, fiber: 0.06, thermal: 1.0, drip: 0.94, frame: 0.15, dust: 0.26 },
  },
};

const BUILTIN_DEFAULT_PRESET = "THERMAL DRIP COLUMN";

const DEFAULT_VISUAL_STATE = Object.freeze({
  presetName: BUILTIN_DEFAULT_PRESET,
  renderScale: 0.6,
  contrast: 2.2,
  paperWhite: 0.63,
  backgroundTone: 0.6,
  paperGrain: 1.0,
  exposure: 0.59,
  bloomStrength: 0.55,
  blurStrength: 0.85,
  overlapEmphasis: 1.0,
  thermalBoost: 0.0,
  opacity: 0.66,
});

const DEFAULT_RHYTHM_STATE = Object.freeze({
  lowGain: 1.0,
  midGain: 1.0,
  highGain: 1.0,
  macroGain: 1.0,
  randomLowThreshold: 0.82,
  randomMidThreshold: 0.78,
  soundLowThreshold: 0.56,
  soundMidThreshold: 0.52,
});

const USER_PRESET_STORAGE_KEY = "strata.savedVisualPresets.v1";
const USER_PRESET_LAST_KEY = "strata.savedVisualPresets.last";
const USER_PRESET_STORAGE_BACKUP_KEYS = Object.freeze([
  "strata.savedVisualPresets.v1.backupA",
  "strata.savedVisualPresets.v1.backupB",
]);
const USER_PRESET_LAST_BACKUP_KEYS = Object.freeze([
  "strata.savedVisualPresets.last.backupA",
  "strata.savedVisualPresets.last.backupB",
]);
const PRESET_STORE_FORMAT = "strata-preset-store-v2";

const EFFECT_TOGGLE_KEYS = Object.freeze([
  "bloom",
  "void",
  "ring",
  "stack",
  "bokeh",
  "thermal",
  "drip",
  "frame",
  "shear",
  "fiber",
  "dust",
]);

const EFFECT_TOGGLE_LABELS = Object.freeze({
  bloom: "Bloom",
  void: "Void",
  ring: "Ring",
  stack: "Stack",
  bokeh: "Bokeh",
  thermal: "Thermal",
  drip: "Drip",
  frame: "Frame",
  shear: "Shear",
  fiber: "Fiber",
  dust: "Dust",
});

const DEFAULT_EFFECT_ENABLED_STATE = Object.freeze({
  bloom: true,
  void: true,
  ring: true,
  stack: true,
  bokeh: true,
  thermal: true,
  drip: true,
  frame: true,
  shear: true,
  fiber: true,
  dust: true,
});

const DEFAULT_EFFECT_AMOUNT_STATE = Object.freeze({
  bloom: 0.5,
  void: 0.5,
  ring: 0.5,
  stack: 0.5,
  bokeh: 1.0,
  thermal: 0.5,
  drip: 0.5,
  frame: 0.5,
  shear: 0.5,
  fiber: 0.5,
  dust: 0.5,
});

const EFFECT_SPEED_BOUNDS = Object.freeze([0.2, 6.0]);

const DEFAULT_EFFECT_SPEED_STATE = Object.freeze({
  bloom: 1.0,
  void: 1.0,
  ring: 1.0,
  stack: 1.0,
  bokeh: 1.0,
  thermal: 1.0,
  drip: 1.0,
  frame: 1.0,
  shear: 1.0,
  fiber: 1.0,
  dust: 1.0,
});

const VISUAL_BOUNDS = Object.freeze({
  renderScale: [0.25, 2.2],
  contrast: [0.5, 3.0],
  paperWhite: [0.0, 1.0],
  backgroundTone: [0.0, 1.2],
  paperGrain: [0.0, 2.5],
  exposure: [0.2, 3.0],
  bloomStrength: [0.0, 2.5],
  blurStrength: [0.0, 2.5],
  overlapEmphasis: [0.0, 3.0],
  thermalBoost: [0.0, 2.0],
  opacity: [0.2, 1.0],
});

const RANDOMIZE_BOUNDS = Object.freeze({
  contrast: [1.1, 2.85],
  paperWhite: [0.42, 0.8],
  backgroundTone: [0.6, 0.95],
  paperGrain: [0.45, 2.2],
  exposure: [0.35, 1.3],
  bloomStrength: [0.15, 1.3],
  blurStrength: [0.35, 1.8],
  overlapEmphasis: [0.7, 2.0],
  thermalBoost: [0.0, 0.4],
  opacity: [0.45, 0.95],
});

const RHYTHM_BOUNDS = Object.freeze({
  lowGain: [0.0, 3.0],
  midGain: [0.0, 3.0],
  highGain: [0.0, 3.0],
  macroGain: [0.0, 3.0],
  randomLowThreshold: [0.0, 1.0],
  randomMidThreshold: [0.0, 1.0],
  soundLowThreshold: [0.0, 1.0],
  soundMidThreshold: [0.0, 1.0],
});

const AUDIO_LANE_COOLDOWN = Object.freeze({
  kick: 0.09,
  snare: 0.075,
  hat: 0.045,
  transient: 0.06,
});

const LANE_SENSITIVITY_KEYS = Object.freeze([
  "kick",
  "snare",
  "hat",
  "sustain",
]);

const DEFAULT_LANE_SENSITIVITY_STATE = Object.freeze({
  kick: 1.0,
  snare: 1.0,
  hat: 1.0,
  sustain: 1.0,
});

const EMPTY_AUDIO_LANES = Object.freeze({
  kick: 0,
  snare: 0,
  hat: 0,
  sustain: 0,
  transient: 0,
  kickOnset: 0,
  snareOnset: 0,
  hatOnset: 0,
  transientOnset: 0,
  kickConfidence: 0,
  snareConfidence: 0,
  hatConfidence: 0,
  transientConfidence: 0,
});

const REACTIVITY_MODE = Object.freeze({
  CLASSIC: "classic",
  FRACTURE_SYNC: "fracture_sync",
});

const FRACTURE_INTENSITY_BOUNDS = Object.freeze([0.5, 1.5]);
const FRACTURE_FREQUENCY_BOUNDS = Object.freeze([0.5, 2.5]);

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function rand(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

function clampVisualValue(key, value) {
  const bounds = VISUAL_BOUNDS[key];
  if (!bounds) return Number(value) || 0;
  return clamp(Number(value) || 0, bounds[0], bounds[1]);
}

function clampRhythmValue(key, value) {
  const bounds = RHYTHM_BOUNDS[key];
  if (!bounds) return Number(value) || 0;
  return clamp(Number(value) || 0, bounds[0], bounds[1]);
}

function clampLaneSensitivityValue(_key, value) {
  return clamp(Number(value) || 0, 0.5, 2.5);
}

function normalizeLaneSensitivityState(rawState) {
  const src = (rawState && typeof rawState === "object") ? rawState : {};
  const normalized = {};
  for (const key of LANE_SENSITIVITY_KEYS) {
    const fallback = DEFAULT_LANE_SENSITIVITY_STATE[key];
    normalized[key] = clampLaneSensitivityValue(key, src[key] ?? fallback);
  }
  return normalized;
}

function normalizeVisualState(state, fallbackPresetName = BUILTIN_DEFAULT_PRESET) {
  const src = (state && typeof state === "object") ? state : {};
  const presetName = (typeof src.presetName === "string" && src.presetName) ? src.presetName : fallbackPresetName;
  return {
    presetName,
    renderScale: clampVisualValue("renderScale", src.renderScale ?? DEFAULT_VISUAL_STATE.renderScale),
    contrast: clampVisualValue("contrast", src.contrast ?? DEFAULT_VISUAL_STATE.contrast),
    paperWhite: clampVisualValue("paperWhite", src.paperWhite ?? DEFAULT_VISUAL_STATE.paperWhite),
    backgroundTone: clampVisualValue("backgroundTone", src.backgroundTone ?? DEFAULT_VISUAL_STATE.backgroundTone),
    paperGrain: clampVisualValue("paperGrain", src.paperGrain ?? DEFAULT_VISUAL_STATE.paperGrain),
    exposure: clampVisualValue("exposure", src.exposure ?? DEFAULT_VISUAL_STATE.exposure),
    bloomStrength: clampVisualValue("bloomStrength", src.bloomStrength ?? DEFAULT_VISUAL_STATE.bloomStrength),
    blurStrength: clampVisualValue("blurStrength", src.blurStrength ?? DEFAULT_VISUAL_STATE.blurStrength),
    overlapEmphasis: clampVisualValue("overlapEmphasis", src.overlapEmphasis ?? DEFAULT_VISUAL_STATE.overlapEmphasis),
    thermalBoost: clampVisualValue("thermalBoost", src.thermalBoost ?? DEFAULT_VISUAL_STATE.thermalBoost),
    opacity: clampVisualValue("opacity", src.opacity ?? DEFAULT_VISUAL_STATE.opacity),
    effectEnabled: normalizeEffectEnabledState(src.effectEnabled),
    effectAmount: normalizeEffectAmountState(src.effectAmount ?? effectAmountStateFromPreset(presetName)),
    effectSpeed: normalizeEffectSpeedState(src.effectSpeed),
  };
}

function normalizeSavedPresetMap(rawMap) {
  if (!rawMap || typeof rawMap !== "object") return {};
  const normalized = {};
  for (const [rawName, rawState] of Object.entries(rawMap)) {
    if (typeof rawName !== "string") continue;
    const name = rawName.trim().slice(0, 32);
    if (!name) continue;
    normalized[name] = normalizeVisualState(rawState);
  }
  return normalized;
}

function normalizeEffectEnabledState(rawState) {
  const src = (rawState && typeof rawState === "object") ? rawState : {};
  const normalized = {};
  for (const key of EFFECT_TOGGLE_KEYS) {
    normalized[key] = (typeof src[key] === "boolean")
      ? src[key]
      : DEFAULT_EFFECT_ENABLED_STATE[key];
  }
  return normalized;
}

function normalizeEffectAmountState(rawState) {
  const src = (rawState && typeof rawState === "object") ? rawState : {};
  const normalized = {};
  for (const key of EFFECT_TOGGLE_KEYS) {
    const fallback = DEFAULT_EFFECT_AMOUNT_STATE[key];
    const value = Number(src[key]);
    normalized[key] = Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
  }
  return normalized;
}

function normalizeEffectSpeedState(rawState) {
  const src = (rawState && typeof rawState === "object") ? rawState : {};
  const normalized = {};
  for (const key of EFFECT_TOGGLE_KEYS) {
    const fallback = DEFAULT_EFFECT_SPEED_STATE[key];
    const value = Number(src[key]);
    normalized[key] = Number.isFinite(value)
      ? clamp(value, EFFECT_SPEED_BOUNDS[0], EFFECT_SPEED_BOUNDS[1])
      : fallback;
  }
  return normalized;
}

function effectAmountStateFromPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset || !preset.weights || typeof preset.weights !== "object") {
    return normalizeEffectAmountState();
  }
  return normalizeEffectAmountState(preset.weights);
}

function normalizeRhythmState(rawState) {
  const src = (rawState && typeof rawState === "object") ? rawState : {};
  return {
    lowGain: clampRhythmValue("lowGain", src.lowGain ?? DEFAULT_RHYTHM_STATE.lowGain),
    midGain: clampRhythmValue("midGain", src.midGain ?? DEFAULT_RHYTHM_STATE.midGain),
    highGain: clampRhythmValue("highGain", src.highGain ?? DEFAULT_RHYTHM_STATE.highGain),
    macroGain: clampRhythmValue("macroGain", src.macroGain ?? DEFAULT_RHYTHM_STATE.macroGain),
    randomLowThreshold: clampRhythmValue("randomLowThreshold", src.randomLowThreshold ?? DEFAULT_RHYTHM_STATE.randomLowThreshold),
    randomMidThreshold: clampRhythmValue("randomMidThreshold", src.randomMidThreshold ?? DEFAULT_RHYTHM_STATE.randomMidThreshold),
    soundLowThreshold: clampRhythmValue("soundLowThreshold", src.soundLowThreshold ?? DEFAULT_RHYTHM_STATE.soundLowThreshold),
    soundMidThreshold: clampRhythmValue("soundMidThreshold", src.soundMidThreshold ?? DEFAULT_RHYTHM_STATE.soundMidThreshold),
  };
}

function serializePresetStore(presets, updatedAt = Date.now()) {
  return JSON.stringify({
    _format: PRESET_STORE_FORMAT,
    updatedAt: Number(updatedAt) || Date.now(),
    presets: normalizeSavedPresetMap(presets),
  });
}

function parsePresetStore(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // v2 envelope format.
    if (parsed._format === PRESET_STORE_FORMAT && parsed.presets && typeof parsed.presets === "object") {
      return {
        presets: normalizeSavedPresetMap(parsed.presets),
        updatedAt: Number(parsed.updatedAt) || 0,
      };
    }

    // Legacy format (plain preset map).
    return {
      presets: normalizeSavedPresetMap(parsed),
      updatedAt: 0,
    };
  } catch {
    return null;
  }
}

class AudioInputController {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.freqData = null;
    this.low = 0;
    this.mid = 0;
    this.high = 0;
    this.macro = 0;
    this.lowFloor = 0.02;
    this.midFloor = 0.02;
    this.highFloor = 0.02;
    this.macroFloor = 0.02;

    this.time = 0;
    this.prevKickEnergy = 0;
    this.prevSnareBody = 0;
    this.prevSnareSnap = 0;
    this.prevHatBand = 0;
    this.prevSpectrum = null;
    this.fluxFloor = 0.02;

    this.laneFloor = { kick: 0.02, snare: 0.02, hat: 0.02, transient: 0.02 };
    this.laneDev = { kick: 0.02, snare: 0.02, hat: 0.02, transient: 0.02 };
    this.lastLaneOnset = { kick: -999, snare: -999, hat: -999, transient: -999 };
    this.laneEnv = { kick: 0, snare: 0, hat: 0, sustain: 0, transient: 0 };
    this.laneSensitivity = normalizeLaneSensitivityState();
  }

  get active() {
    return !!(this.audioContext && this.analyser && this.stream);
  }

  async start() {
    if (this.active) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.72;
      this.source.connect(this.analyser);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {
        // Ignore disconnect errors.
      }
    }
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        // Ignore close errors.
      }
    }
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.freqData = null;
    this.low = 0;
    this.mid = 0;
    this.high = 0;
    this.macro = 0;
    this.time = 0;
    this.prevKickEnergy = 0;
    this.prevSnareBody = 0;
    this.prevSnareSnap = 0;
    this.prevHatBand = 0;
    this.prevSpectrum = null;
    this.fluxFloor = 0.02;
    this.laneFloor = { kick: 0.02, snare: 0.02, hat: 0.02, transient: 0.02 };
    this.laneDev = { kick: 0.02, snare: 0.02, hat: 0.02, transient: 0.02 };
    this.lastLaneOnset = { kick: -999, snare: -999, hat: -999, transient: -999 };
    this.laneEnv = { kick: 0, snare: 0, hat: 0, sustain: 0, transient: 0 };
  }

  _bandAverage(sampleRate, lowHz, highHz) {
    if (!this.freqData || !this.analyser) return 0;
    const nyquist = sampleRate * 0.5;
    const size = this.freqData.length;
    const start = clamp(Math.floor((lowHz / nyquist) * size), 0, size - 1);
    const end = clamp(Math.ceil((highHz / nyquist) * size), start + 1, size);
    let sum = 0;
    for (let i = start; i < end; i += 1) sum += this.freqData[i];
    return (sum / Math.max(1, end - start)) / 255;
  }

  _normalizeBand(value, floorKey) {
    this[floorKey] = this[floorKey] * 0.996 + value * 0.004;
    return clamp((value - this[floorKey]) * 4.2, 0, 1);
  }

  _laneThreshold(name, score, dt, base = 0.05, devMul = 2.7) {
    const floorBlend = Math.min(1, Math.max(0.001, dt) * 1.0);
    const devBlend = Math.min(1, Math.max(0.001, dt) * 2.5);
    this.laneFloor[name] += (score - this.laneFloor[name]) * floorBlend;
    const absDelta = Math.abs(score - this.laneFloor[name]);
    this.laneDev[name] += (absDelta - this.laneDev[name]) * devBlend;
    const threshold = this.laneFloor[name] + base + this.laneDev[name] * devMul;
    const confidence = clamp((score - threshold) / Math.max(0.08, this.laneDev[name] * 3.2), 0, 1);
    return { threshold, confidence };
  }

  _detectLaneOnset(name, score, threshold, now, cooldownSec, minLead = 0.03) {
    if (score <= threshold) return false;
    if (score <= this.laneFloor[name] + minLead) return false;
    if (now - this.lastLaneOnset[name] < cooldownSec) return false;
    this.lastLaneOnset[name] = now;
    return true;
  }

  _followEnvelope(value, target, dt, attack, release) {
    const rate = target > value ? attack : release;
    const blend = Math.min(1, Math.max(0.001, dt) * rate);
    return value + (target - value) * blend;
  }

  getLaneSensitivity(name) {
    if (!this.laneSensitivity || !(name in this.laneSensitivity)) return 1;
    return clampLaneSensitivityValue(name, this.laneSensitivity[name]);
  }

  setLaneSensitivity(name, value) {
    if (!this.laneSensitivity || !(name in this.laneSensitivity)) return 1;
    const next = clampLaneSensitivityValue(name, value);
    this.laneSensitivity[name] = next;
    return next;
  }

  setLaneSensitivityState(state) {
    this.laneSensitivity = normalizeLaneSensitivityState(state);
  }

  captureLaneSensitivityState() {
    return { ...this.laneSensitivity };
  }

  getRhythm(dt) {
    if (!this.active || !this.audioContext || !this.analyser || !this.freqData) {
      return { low: 0, mid: 0, high: 0, macro: 0, lanes: { ...EMPTY_AUDIO_LANES } };
    }
    this.analyser.getByteFrequencyData(this.freqData);
    const sampleRate = this.audioContext.sampleRate || 48000;

    const lowRaw = this._bandAverage(sampleRate, 35, 180);
    const midRaw = this._bandAverage(sampleRate, 180, 1200);
    const highRaw = this._bandAverage(sampleRate, 1200, 6500);
    const macroRaw = this._bandAverage(sampleRate, 35, 6500);

    const lowNorm = Math.pow(this._normalizeBand(lowRaw, "lowFloor"), 0.82);
    const midNorm = Math.pow(this._normalizeBand(midRaw, "midFloor"), 0.9);
    const highNorm = Math.pow(this._normalizeBand(highRaw, "highFloor"), 0.98);
    const macroNorm = Math.pow(this._normalizeBand(macroRaw, "macroFloor"), 0.9);

    const smooth = Math.min(1, Math.max(0.001, dt) * 18);
    this.low += (lowNorm - this.low) * smooth;
    this.mid += (midNorm - this.mid) * smooth;
    this.high += (highNorm - this.high) * smooth;
    this.macro += (macroNorm - this.macro) * smooth;

    const subBand = this._bandAverage(sampleRate, 28, 70);
    const kickBand = this._bandAverage(sampleRate, 70, 150);
    const snareBody = this._bandAverage(sampleRate, 150, 280);
    const snareSnap = this._bandAverage(sampleRate, 1500, 4200);
    const hatBand = this._bandAverage(sampleRate, 6000, 12000);
    const sustainBand = this._bandAverage(sampleRate, 260, 1400);
    const presenceBand = this._bandAverage(sampleRate, 900, 3200);
    if (!this.prevSpectrum || this.prevSpectrum.length !== this.freqData.length) {
      this.prevSpectrum = new Float32Array(this.freqData.length);
    }
    const nyquist = sampleRate * 0.5;
    let fluxSum = 0;
    let fluxCount = 0;
    for (let i = 0; i < this.freqData.length; i += 1) {
      const current = this.freqData[i] / 255;
      const prev = this.prevSpectrum[i];
      this.prevSpectrum[i] = current;
      const hz = (i / this.freqData.length) * nyquist;
      if (hz < 90 || hz > 12500) continue;
      const diff = current - prev;
      if (diff > 0) fluxSum += diff;
      fluxCount += 1;
    }
    const spectralFluxRaw = fluxSum / Math.max(1, fluxCount * 0.22);
    this.fluxFloor = this.fluxFloor * 0.992 + spectralFluxRaw * 0.008;
    const spectralFlux = clamp((spectralFluxRaw - this.fluxFloor) * 3.4, 0, 1.8);

    const kickEnergy = subBand + kickBand;
    const kickFlux = Math.max(0, kickEnergy - this.prevKickEnergy);
    const snareBodyFlux = Math.max(0, snareBody - this.prevSnareBody);
    const snareSnapFlux = Math.max(0, snareSnap - this.prevSnareSnap);
    const hatFlux = Math.max(0, hatBand - this.prevHatBand);
    this.prevKickEnergy = kickEnergy;
    this.prevSnareBody = snareBody;
    this.prevSnareSnap = snareSnap;
    this.prevHatBand = hatBand;

    const kickScore = clamp(subBand * 0.95 + kickBand * 0.82 + kickFlux * 2.2 + lowNorm * 0.36, 0, 1.6);
    const snareScore = clamp(snareBody * 0.74 + snareSnap * 0.56 + snareBodyFlux * 1.05 + snareSnapFlux * 1.55 + midNorm * 0.32, 0, 1.6);
    const hatScore = clamp(hatBand * 0.92 + hatFlux * 2.4 + highNorm * 0.28, 0, 1.6);
    const transientScore = clamp(
      spectralFlux * 0.85 + snareSnapFlux * 1.05 + hatFlux * 0.95 + highNorm * 0.2 + snareScore * 0.18,
      0,
      1.8,
    );
    const sustainScore = clamp((sustainBand * 0.92 + presenceBand * 0.42 + macroNorm * 0.3) - transientScore * 0.35, 0, 1.4);

    const kickSensitivity = this.getLaneSensitivity("kick");
    const snareSensitivity = this.getLaneSensitivity("snare");
    const hatSensitivity = this.getLaneSensitivity("hat");
    const sustainSensitivity = this.getLaneSensitivity("sustain");
    const kickThresholdScale = 1 / Math.pow(kickSensitivity, 0.68);
    const snareThresholdScale = 1 / Math.pow(snareSensitivity, 0.68);
    const hatThresholdScale = 1 / Math.pow(hatSensitivity, 0.68);
    const kickLevelScale = Math.pow(kickSensitivity, 0.55);
    const snareLevelScale = Math.pow(snareSensitivity, 0.55);
    const hatLevelScale = Math.pow(hatSensitivity, 0.55);
    const sustainLevelScale = Math.pow(sustainSensitivity, 0.55);

    this.time += Math.max(0.001, dt);
    const kickStats = this._laneThreshold("kick", kickScore, dt, 0.05 * kickThresholdScale, 2.6 * kickThresholdScale);
    const snareStats = this._laneThreshold("snare", snareScore, dt, 0.05 * snareThresholdScale, 2.5 * snareThresholdScale);
    const hatStats = this._laneThreshold("hat", hatScore, dt, 0.04 * hatThresholdScale, 2.25 * hatThresholdScale);
    const transientStats = this._laneThreshold("transient", transientScore, dt, 0.045, 2.2);
    const kickOnset = this._detectLaneOnset("kick", kickScore, kickStats.threshold, this.time, AUDIO_LANE_COOLDOWN.kick, 0.03 * kickThresholdScale);
    const snareOnset = this._detectLaneOnset("snare", snareScore, snareStats.threshold, this.time, AUDIO_LANE_COOLDOWN.snare, 0.025 * snareThresholdScale);
    const hatOnset = this._detectLaneOnset("hat", hatScore, hatStats.threshold, this.time, AUDIO_LANE_COOLDOWN.hat, 0.02 * hatThresholdScale);
    const transientOnset = this._detectLaneOnset("transient", transientScore, transientStats.threshold, this.time, AUDIO_LANE_COOLDOWN.transient, 0.018);

    const kickTargetBase = kickOnset ? clamp(kickStats.confidence * 0.8 + kickScore * 0.35, 0, 1) : kickStats.confidence * 0.35;
    const snareTargetBase = snareOnset ? clamp(snareStats.confidence * 0.8 + snareScore * 0.34, 0, 1) : snareStats.confidence * 0.32;
    const hatTargetBase = hatOnset ? clamp(hatStats.confidence * 0.82 + hatScore * 0.3, 0, 1) : hatStats.confidence * 0.42;
    const transientTargetBase = transientOnset
      ? clamp(transientStats.confidence * 0.86 + transientScore * 0.44, 0, 1)
      : transientStats.confidence * 0.5;
    const sustainTargetBase = clamp(sustainScore * 0.92 + this.macro * 0.18, 0, 1);
    const kickTarget = clamp(kickTargetBase * kickLevelScale, 0, 1);
    const snareTarget = clamp(snareTargetBase * snareLevelScale, 0, 1);
    const hatTarget = clamp(hatTargetBase * hatLevelScale, 0, 1);
    const transientTarget = clamp(transientTargetBase, 0, 1);
    const sustainTarget = clamp(sustainTargetBase * sustainLevelScale, 0, 1);
    this.laneEnv.kick = this._followEnvelope(this.laneEnv.kick, kickTarget, dt, 28.0, 9.0);
    this.laneEnv.snare = this._followEnvelope(this.laneEnv.snare, snareTarget, dt, 24.0, 10.0);
    this.laneEnv.hat = this._followEnvelope(this.laneEnv.hat, hatTarget, dt, 34.0, 15.0);
    this.laneEnv.transient = this._followEnvelope(this.laneEnv.transient, transientTarget, dt, 38.0, 18.0);
    this.laneEnv.sustain = this._followEnvelope(this.laneEnv.sustain, sustainTarget, dt, 6.0, 3.0);

    const lanes = {
      kick: clamp(this.laneEnv.kick, 0, 1),
      snare: clamp(this.laneEnv.snare, 0, 1),
      hat: clamp(this.laneEnv.hat, 0, 1),
      sustain: clamp(this.laneEnv.sustain, 0, 1),
      transient: clamp(this.laneEnv.transient, 0, 1),
      kickOnset: kickOnset ? 1 : 0,
      snareOnset: snareOnset ? 1 : 0,
      hatOnset: hatOnset ? 1 : 0,
      transientOnset: transientOnset ? 1 : 0,
      kickConfidence: kickStats.confidence,
      snareConfidence: snareStats.confidence,
      hatConfidence: hatStats.confidence,
      transientConfidence: transientStats.confidence,
    };

    return {
      low: clamp(this.low * 1.25, 0, 1),
      mid: clamp(this.mid * 1.25, 0, 1),
      high: clamp(this.high * 1.3, 0, 1),
      macro: clamp(this.macro * 1.2, 0, 1),
      lanes,
    };
  }
}

class PlateEvent {
  constructor(kind, x, y, radius, intensity, lifetime, color, seed, aux, aux2, moduleName = "") {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.intensity = intensity;
    this.lifetime = lifetime;
    this.color = color;
    this.seed = seed;
    this.aux = aux;
    this.aux2 = aux2;
    this.module = moduleName;
    this.age = 0;
  }
}

class StrataScheduler {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Pre-allocated uniform buffers (reused every frame, zero GC pressure).
    this._uniData0 = new Float32Array(MAX_PLATES * 4);
    this._uniData1 = new Float32Array(MAX_PLATES * 4);
    this._uniData2 = new Float32Array(MAX_PLATES * 4);
    this._uniPacked = { count: 0, data0: this._uniData0, data1: this._uniData1, data2: this._uniData2 };

    // Default look from the reference panel values.
    this.depth = 1.0;
    this.paper_grain = DEFAULT_VISUAL_STATE.paperGrain;
    this.background_tone = DEFAULT_VISUAL_STATE.backgroundTone;
    this.global_opacity = DEFAULT_VISUAL_STATE.opacity;
    this.thermal_boost = DEFAULT_VISUAL_STATE.thermalBoost;
    this.exposure = DEFAULT_VISUAL_STATE.exposure;
    this.bloom_strength = DEFAULT_VISUAL_STATE.bloomStrength;
    this.blur_strength = DEFAULT_VISUAL_STATE.blurStrength;
    this.overlap_emphasis = DEFAULT_VISUAL_STATE.overlapEmphasis;
    this.contrast = DEFAULT_VISUAL_STATE.contrast;
    this.paper_white = DEFAULT_VISUAL_STATE.paperWhite;
    this.effect_enabled = normalizeEffectEnabledState();
    this.effect_amount = normalizeEffectAmountState();
    this.effect_speed = normalizeEffectSpeedState();
    this.rhythm = normalizeRhythmState();
    this.setRhythmState(this.rhythm);

    this.events = [];
    this.preset_names = Object.keys(PRESETS);
    this.preset_index = this.preset_names.indexOf(DEFAULT_VISUAL_STATE.presetName);
    if (this.preset_index < 0) this.preset_index = 0;
    this.effect_amount = effectAmountStateFromPreset(this.presetName);

    this.ambient_clock = 0.0;
    this.high_clock = 0.0;
    this.hat_clock = 0.0;
    this.prev_low = 0.0;
    this.prev_mid = 0.0;
    this.macro_slow = 0.0;
    this.last_macro_shift = -999.0;
    this.palette_override = null;
    this.palette_override_until = 0.0;

    this.reactivity_mode = REACTIVITY_MODE.CLASSIC;
    this.fracture_intensity = 1.0;
    this.fracture_frequency = 1.0;
    this.fracture_pulse = 0.0;
    this.fracture_combo = 0.0;
    this.fracture_last_fire = -999.0;
    this.fracture_hold = 0.0;
    this.fracture_duration = 0.0;
    this.fracture_rect = { cx: 0.5, cy: 0.5, w: 0.24, h: 0.18, feather: 0.08 };
    this.fracture_rotation = 0.0;
    this.fracture_rotation_vel = 0.0;
    this.fracture_invert = 0.0;
    this.fracture_glitch = 0.0;
    this.fracture_seed = Math.random() * 999.0;
  }

  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  get presetName() {
    return this.preset_names[this.preset_index];
  }

  get preset() {
    return PRESETS[this.presetName];
  }

  cyclePreset(step = 1) {
    const n = this.preset_names.length;
    this.preset_index = (this.preset_index + step + n) % n;
    this.effect_amount = effectAmountStateFromPreset(this.presetName);
  }

  setPresetByName(name) {
    const idx = this.preset_names.indexOf(name);
    if (idx >= 0) {
      this.preset_index = idx;
      this.effect_amount = effectAmountStateFromPreset(this.presetName);
    }
  }

  resetScene() {
    this.events.length = 0;
    this.depth = 1.0;
  }

  bleach() {
    for (const ev of this.events) {
      ev.age = Math.max(ev.age, ev.lifetime * 0.85);
    }
  }

  isEffectEnabled(name) {
    if (!(name in this.effect_enabled)) return true;
    return !!this.effect_enabled[name];
  }

  setEffectEnabled(name, enabled) {
    if (!(name in this.effect_enabled)) return;
    this.effect_enabled[name] = !!enabled;
  }

  setEffectEnabledState(state) {
    this.effect_enabled = normalizeEffectEnabledState(state);
  }

  captureEffectEnabledState() {
    return { ...this.effect_enabled };
  }

  getEffectAmount(name) {
    if (!(name in this.effect_amount)) return 1;
    return clamp(this.effect_amount[name], 0, 1);
  }

  setEffectAmount(name, amount) {
    if (!(name in this.effect_amount)) return;
    this.effect_amount[name] = clamp(Number(amount) || 0, 0, 1);
  }

  setEffectAmountState(state) {
    this.effect_amount = normalizeEffectAmountState(state);
  }

  captureEffectAmountState() {
    return { ...this.effect_amount };
  }

  getEffectSpeed(name) {
    if (!(name in this.effect_speed)) return 1;
    return clamp(this.effect_speed[name], EFFECT_SPEED_BOUNDS[0], EFFECT_SPEED_BOUNDS[1]);
  }

  setEffectSpeed(name, speed) {
    if (!(name in this.effect_speed)) return;
    this.effect_speed[name] = clamp(Number(speed) || 0, EFFECT_SPEED_BOUNDS[0], EFFECT_SPEED_BOUNDS[1]);
  }

  setEffectSpeedState(state) {
    this.effect_speed = normalizeEffectSpeedState(state);
  }

  captureEffectSpeedState() {
    return { ...this.effect_speed };
  }

  setRhythmState(state) {
    const normalized = normalizeRhythmState(state);
    this.rhythm = normalized;
    this.rhythm_low_gain = normalized.lowGain;
    this.rhythm_mid_gain = normalized.midGain;
    this.rhythm_high_gain = normalized.highGain;
    this.rhythm_macro_gain = normalized.macroGain;
    this.random_low_threshold = normalized.randomLowThreshold;
    this.random_mid_threshold = normalized.randomMidThreshold;
    this.sound_low_threshold = normalized.soundLowThreshold;
    this.sound_mid_threshold = normalized.soundMidThreshold;
  }

  setReactivityMode(mode) {
    this.reactivity_mode = mode === REACTIVITY_MODE.FRACTURE_SYNC
      ? REACTIVITY_MODE.FRACTURE_SYNC
      : REACTIVITY_MODE.CLASSIC;
    if (this.reactivity_mode === REACTIVITY_MODE.CLASSIC) {
      this.fracture_pulse = 0;
      this.fracture_combo = 0;
      this.fracture_hold = 0;
      this.fracture_invert = 0;
      this.fracture_glitch = 0;
      this.fracture_rotation_vel = 0;
    }
  }

  getReactivityMode() {
    return this.reactivity_mode;
  }

  setFractureIntensity(value) {
    this.fracture_intensity = clamp(Number(value) || 1, FRACTURE_INTENSITY_BOUNDS[0], FRACTURE_INTENSITY_BOUNDS[1]);
    return this.fracture_intensity;
  }

  getFractureIntensity() {
    return this.fracture_intensity;
  }

  setFractureFrequency(value) {
    this.fracture_frequency = clamp(Number(value) || 1, FRACTURE_FREQUENCY_BOUNDS[0], FRACTURE_FREQUENCY_BOUNDS[1]);
    return this.fracture_frequency;
  }

  getFractureFrequency() {
    return this.fracture_frequency;
  }

  getRhythmValue(key) {
    if (!this.rhythm || !(key in this.rhythm)) return 0;
    return this.rhythm[key];
  }

  setRhythmValue(key, value) {
    if (!(key in DEFAULT_RHYTHM_STATE)) return;
    const next = { ...this.rhythm, [key]: clampRhythmValue(key, value) };
    this.setRhythmState(next);
  }

  captureRhythmState() {
    return { ...this.rhythm };
  }

  _filterWeightsByEnabled(weights) {
    const filtered = {};
    for (const [name, value] of Object.entries(weights)) {
      filtered[name] = this.isEffectEnabled(name) ? value : 0;
    }
    return filtered;
  }

  _eventModuleName(event) {
    if (event && typeof event.module === "string" && event.module) {
      return event.module;
    }
    return KIND_TO_EFFECT[event.kind] || "";
  }

  _toRGB01(rgb255, jitter = 0.08) {
    return rgb255.map((c) => clamp(c / 255 + rand(-jitter, jitter), 0, 1));
  }

  _activePaletteName(time) {
    if (this.palette_override && time < this.palette_override_until) {
      return this.palette_override;
    }
    return this.preset.palette;
  }

  currentPaletteName(time) {
    return this._activePaletteName(time);
  }

  currentPaperTint(time) {
    const tint = PALETTES[this._activePaletteName(time)].paper_tint;
    return [tint[0] / 255, tint[1] / 255, tint[2] / 255];
  }

  _pickColor(time, accentBias = 0.55, paletteName = null) {
    const p = PALETTES[paletteName || this._activePaletteName(time)];
    const r = Math.random();
    if (r < (0.32 - accentBias * 0.18)) return this._toRGB01(p.ink_b, 0.05);
    if (r < (0.65 - accentBias * 0.08)) return this._toRGB01(p.ink_a, 0.06);
    return this._toRGB01(p.accents[Math.floor(Math.random() * p.accents.length)], 0.1);
  }

  _weightedModule(weights) {
    const items = Object.entries(weights).filter(([, v]) => v > 0);
    const total = items.reduce((acc, [, v]) => acc + v, 0);
    if (total <= 0) {
      for (const key of EFFECT_TOGGLE_KEYS) {
        if (this.isEffectEnabled(key)) return key;
      }
      return "bloom";
    }
    let r = rand(0, total);
    for (const [name, value] of items) {
      r -= value;
      if (r <= 0) return name;
    }
    return items[items.length - 1][0];
  }

  _randomPoint(centerBias = 0.62) {
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const x = (1 - centerBias) * rand(0, this.width) + centerBias * cx;
    const y = (1 - centerBias) * rand(0, this.height) + centerBias * cy;
    return [clamp(x, 0, this.width), clamp(y, 0, this.height)];
  }

  _randomFractureRect() {
    const rect = {
      cx: rand(0.12, 0.88),
      cy: rand(0.12, 0.88),
      w: rand(0.1, 0.42),
      h: rand(0.08, 0.34),
      feather: rand(0.05, 0.12),
    };
    rect.cx = clamp(rect.cx, rect.w * 0.55, 1 - rect.w * 0.55);
    rect.cy = clamp(rect.cy, rect.h * 0.55, 1 - rect.h * 0.55);
    return rect;
  }

  _addEvent(kind, x, y, radius, intensity, lifetime, color, aux, aux2 = 0, moduleName = "") {
    this.events.push(
      new PlateEvent(
        kind,
        x,
        y,
        Math.max(4, radius),
        Math.max(0.02, intensity),
        Math.max(0.2, lifetime),
        color,
        Math.random(),
        clamp(aux, 0, 1),
        clamp(aux2, 0, 1),
        moduleName,
      ),
    );
  }

  _spawnModule(name, x, y, amp, time) {
    if (!this.isEffectEnabled(name)) return;
    const base = Math.min(this.width, this.height);
    const add = (kind, px, py, radius, intensity, lifetime, color, aux, aux2 = 0) => {
      this._addEvent(kind, px, py, radius, intensity, lifetime, color, aux, aux2, name);
    };

    if (name === "bloom") {
      add(KIND.BLOOM, x, y, base * rand(0.045, 0.19), rand(0.48, 1.15) * amp, rand(7, 15), this._pickColor(time, 0.25), Math.random(), rand(0.25, 0.95));
      return;
    }

    if (name === "void") {
      add(KIND.VOID, x, y, base * rand(0.03, 0.12), rand(0.45, 0.92) * amp, rand(3, 8), [0, 0, 0], 0, rand(0.25, 0.8));
      return;
    }

    if (name === "ring") {
      add(KIND.RING, x, y, base * rand(0.035, 0.15), rand(0.4, 1.0) * amp, rand(8, 16), this._pickColor(time, 0.46), rand(0.25, 0.95), rand(0.15, 0.92));
      return;
    }

    if (name === "stack") {
      const count = Math.floor(rand(3, 10));
      const spacing = base * rand(0.018, 0.038);
      const y0 = y - spacing * (count * 0.5);
      for (let i = 0; i < count; i += 1) {
        add(
          KIND.RING,
          x + rand(-8, 8),
          y0 + spacing * i,
          base * rand(0.02, 0.08),
          rand(0.32, 0.88) * amp,
          rand(7, 13),
          this._pickColor(time, 0.52),
          rand(0.5, 1.0),
          rand(0.25, 0.95),
        );
      }
      return;
    }

    if (name === "bokeh") {
      add(KIND.BOKEH, x, y, base * rand(0.04, 0.26), rand(0.36, 0.98) * amp, rand(9, 18), this._pickColor(time, 0.9), rand(0.3, 1.0), rand(0.2, 1.0));
      return;
    }

    if (name === "spore") {
      // Spore disabled by request.
      return;
    }

    if (name === "thermal") {
      add(KIND.THERMAL, x, y, base * rand(0.03, 0.14), rand(0.45, 1.2) * amp, rand(3, 7), this._pickColor(time, 0.8, "thermal"), rand(0.45, 1.0), rand(0.35, 1.0));
      return;
    }

    if (name === "drip") {
      add(KIND.DRIP, x, y, base * rand(0.014, 0.04), rand(0.38, 0.9) * amp, rand(6, 11), this._pickColor(time, 0.3), rand(0.2, 1.0), rand(0.05, 0.7));
      return;
    }

    if (name === "frame") {
      add(KIND.FRAME, x, y, base * rand(0.1, 0.3), rand(0.24, 0.62) * amp, rand(9, 17), this._pickColor(time, 0.45), rand(0.0, 1.0), rand(0.1, 0.8));
      return;
    }

    if (name === "shear") {
      add(KIND.SHEAR, x, y, base * rand(0.06, 0.22), rand(0.24, 0.75) * amp, rand(5, 11), this._pickColor(time, 0.34), rand(0.2, 1.0), rand(0.0, 1.0));
      return;
    }

    if (name === "fiber") {
      add(KIND.FIBER, x, y, base * rand(0.035, 0.12), rand(0.25, 0.82) * amp, rand(6, 13), this._pickColor(time, 0.18), rand(0.2, 1.0), rand(0.1, 0.85));
      return;
    }

    if (name === "dust") {
      add(KIND.DUST, x, y, base * rand(0.05, 0.2), rand(0.28, 0.95) * amp, rand(10, 20), this._pickColor(time, 0.68), rand(0.2, 1.0), rand(0.12, 0.96));
    }
  }

  _rhythm(time) {
    const low = Math.pow((Math.sin(time * Math.PI * 2 * 0.34) + 1) * 0.5, 5.4);
    const mid = Math.pow((Math.sin(time * Math.PI * 2 * 0.68 + 0.9) + 1) * 0.5, 4.2);
    const highA = Math.pow((Math.sin(time * Math.PI * 2 * 1.55 + 0.4) + 1) * 0.5, 2.2);
    const highB = Math.pow((Math.sin(time * Math.PI * 2 * 2.35 + 1.7) + 1) * 0.5, 2.0);
    const high = Math.min(1, highA * 0.58 + highB * 0.42);
    const macro = 0.48 * ((Math.sin(time * 0.09) + 1) * 0.5) + 0.52 * ((Math.sin(time * 0.05 + 1.7) + 1) * 0.5);
    return [low, mid, high, macro];
  }

  update(dt, time, externalRhythm = null) {
    dt = clamp(dt, 0, 0.05);

    const [lowRaw, midRaw, highRaw, macroRaw] = externalRhythm
      ? [externalRhythm.low, externalRhythm.mid, externalRhythm.high, externalRhythm.macro]
      : this._rhythm(time);
    const low = clamp(lowRaw * this.rhythm_low_gain, 0, 1);
    const mid = clamp(midRaw * this.rhythm_mid_gain, 0, 1);
    const high = clamp(highRaw * this.rhythm_high_gain, 0, 1);
    const macro = clamp(macroRaw * this.rhythm_macro_gain, 0, 1);
    this.macro_slow += (macro - this.macro_slow) * Math.min(1, dt * 0.35);

    const hasAudioLanes = !!(externalRhythm && externalRhythm.lanes && typeof externalRhythm.lanes === "object");
    const lanes = hasAudioLanes
      ? { ...EMPTY_AUDIO_LANES, ...externalRhythm.lanes }
      : EMPTY_AUDIO_LANES;
    const lowThreshold = externalRhythm ? this.sound_low_threshold : this.random_low_threshold;
    const midThreshold = externalRhythm ? this.sound_mid_threshold : this.random_mid_threshold;
    const lowOnset = !hasAudioLanes && low > lowThreshold && this.prev_low <= lowThreshold;
    const midOnset = !hasAudioLanes && mid > midThreshold && this.prev_mid <= midThreshold;
    const macroShift = Math.abs(macro - this.macro_slow) > 0.24 && (time - this.last_macro_shift > 5.5);

    this.prev_low = low;
    this.prev_mid = mid;

    this.depth = clamp(this.depth + dt * (0.014 + macro * 0.018), 0, 1);

    const weights = { ...this.effect_amount };
    weights.ring *= 1 + this.depth * 0.45;
    weights.bokeh *= 1 + this.depth * 1.35;
    weights.thermal *= 1 + this.depth * 0.22;
    weights.dust = (weights.dust || 0) * (1.35 + high * 1.05 + this.depth * 0.45);
    weights.fiber = (weights.fiber || 0) * (1 + this.depth * 0.25);
    weights.shear = (weights.shear || 0) * (1 + mid * 0.35);
    const activeWeights = this._filterWeightsByEnabled(weights);
    const kickDrive = clamp((lanes.kick || 0) * 0.75 + (lanes.kickConfidence || 0) * 0.25, 0, 1);
    const snareDrive = clamp((lanes.snare || 0) * 0.75 + (lanes.snareConfidence || 0) * 0.25, 0, 1);
    const hatDrive = clamp((lanes.hat || 0) * 0.7 + (lanes.hatConfidence || 0) * 0.3, 0, 1);
    const sustainDrive = clamp(lanes.sustain || 0, 0, 1);
    const transientDrive = clamp((lanes.transient || 0) * 0.72 + (lanes.transientConfidence || 0) * 0.28, 0, 1);
    const fractureModeActive = hasAudioLanes && this.reactivity_mode === REACTIVITY_MODE.FRACTURE_SYNC;
    const fractureFrequency = this.fracture_frequency;

    if (hasAudioLanes) {
      if (fractureModeActive) {
        const shock = clamp(
          (lanes.snareOnset > 0.5 ? 0.84 : 0.0)
          + (lanes.hatOnset > 0.5 ? 0.56 : 0.0)
          + transientDrive * 0.9
          + (lanes.kickOnset > 0.5 ? 0.06 : 0.0),
          0,
          1.8,
        );
        const pulseDecay = (8.8 - this.fracture_intensity * 1.4) + (1.0 - fractureFrequency) * 0.9;
        this.fracture_pulse = Math.max(this.fracture_pulse * Math.exp(-dt * pulseDecay), shock);
        const hatBurst = (lanes.hatOnset > 0.5) || (hatDrive > 0.72 && transientDrive > 0.48);
        const comboAdd = (lanes.snareOnset > 0.5 ? 0.55 : 0.0)
          + (hatBurst ? 0.3 : 0.0)
          + transientDrive * 0.4
          + (lanes.kickOnset > 0.5 ? 0.08 : 0.0);
        this.fracture_combo = clamp(this.fracture_combo + comboAdd - dt * (0.95 / fractureFrequency), 0, 2.4);

        const fireCooldown = clamp((0.72 - this.fracture_intensity * 0.12) / Math.max(0.35, fractureFrequency), 0.22, 1.4);
        const canFire = (time - this.fracture_last_fire) > fireCooldown;
        const isArmed = transientDrive > (0.62 - (this.fracture_intensity - 1.0) * 0.08);
        const isPattern = (lanes.snareOnset > 0.5) || (hatBurst && transientDrive > 0.46);
        const comboReady = this.fracture_combo > 0.95;

        if (canFire && isArmed && isPattern && comboReady) {
          this.fracture_last_fire = time;
          this.fracture_combo *= 0.38;
          this.fracture_rect = this._randomFractureRect();
          this.fracture_seed = rand(0, 4096);
          this.fracture_duration = rand(0.1, 0.28) * (0.9 + this.fracture_intensity * 0.25);
          this.fracture_hold = this.fracture_duration;
          this.fracture_invert = clamp(0.52 + transientDrive * 0.42 + snareDrive * 0.22, 0, 1);
          this.fracture_glitch = clamp(0.48 + hatDrive * 0.4 + transientDrive * 0.36, 0, 1);
          const spinSign = Math.random() < 0.5 ? -1 : 1;
          this.fracture_rotation_vel += spinSign * (0.6 + snareDrive * 1.6 + transientDrive * 1.2) * this.fracture_intensity;

          const burstCount = Math.floor(2 + this.fracture_intensity * 2 + transientDrive * 3);
          const regionX = this.fracture_rect.cx * this.width;
          const regionY = this.fracture_rect.cy * this.height;
          const regionHalfW = this.fracture_rect.w * this.width * 0.5;
          const regionHalfH = this.fracture_rect.h * this.height * 0.5;
          for (let i = 0; i < burstCount; i += 1) {
            const x = clamp(regionX + rand(-regionHalfW, regionHalfW), 0, this.width);
            const y = clamp(regionY + rand(-regionHalfH, regionHalfH), 0, this.height);
            const pick = this._weightedModule({
              shear: (activeWeights.shear || 0) * 1.2,
              ring: activeWeights.ring * 0.9,
              dust: (activeWeights.dust || 0) * 1.1,
              frame: activeWeights.frame * 0.65,
              thermal: activeWeights.thermal * 0.55,
              bokeh: activeWeights.bokeh * 0.35,
            });
            this._spawnModule(pick, x, y, 0.46 + transientDrive * 0.76 + this.fracture_pulse * 0.22, time);
          }
        }

        // Kick influence intentionally minimized: only occasional low-weight accent.
        if (lanes.kickOnset > 0.5 && Math.random() < 0.14 * this.getEffectAmount("drip")) {
          const [x, y] = this._randomPoint(0.74);
          this._spawnModule("drip", x + rand(-10, 10), y - rand(0, 16), 0.34 + kickDrive * 0.25, time);
        }

        if (lanes.snareOnset > 0.5) {
          const [x, y] = this._randomPoint(0.62);
          const pick = this._weightedModule({
            ring: activeWeights.ring,
            frame: activeWeights.frame * 0.95,
            shear: (activeWeights.shear || 0) * 0.82,
            stack: activeWeights.stack * 0.58,
            thermal: activeWeights.thermal * 0.3,
          });
          this._spawnModule(pick, x, y, 0.88 + snareDrive * 0.9 + this.fracture_pulse * 0.25, time);
        }

        this.hat_clock += dt * (0.45 + hatDrive * 7.2 + transientDrive * 4.4 + this.fracture_pulse * 5.2 + high * 0.8) * fractureFrequency;
        const hatInterval = clamp((0.16 - this.fracture_pulse * 0.08 - transientDrive * 0.03) / fractureFrequency, 0.03, 0.28);
        if (this.hat_clock > hatInterval) {
          this.hat_clock = 0;
          if (Math.random() < (0.44 + hatDrive * 0.56 + transientDrive * 0.22)) {
            const [x, y] = this._randomPoint(0.54);
            const pick = this._weightedModule({
              dust: activeWeights.dust || 0,
              shear: activeWeights.shear || 0,
              fiber: (activeWeights.fiber || 0) * 0.56,
              ring: activeWeights.ring * 0.25,
            });
            this._spawnModule(pick, x, y, 0.34 + hatDrive * 0.52 + this.fracture_pulse * 0.24, time);
          }
        }

        this.high_clock += dt * (0.42 + transientDrive * 4.8 + this.fracture_pulse * 3.4 + high * 1.6) * fractureFrequency;
        const transientInterval = clamp((0.26 - this.fracture_pulse * 0.12) / fractureFrequency, 0.05, 0.36);
        if (this.high_clock > transientInterval) {
          this.high_clock = 0;
          if (Math.random() < (0.3 + transientDrive * 0.55)) {
            const [x, y] = this._randomPoint(0.6);
            const pick = this._weightedModule({
              thermal: activeWeights.thermal,
              ring: activeWeights.ring * 0.65,
              void: activeWeights.void * 0.35,
              bokeh: activeWeights.bokeh * 0.42,
              drip: activeWeights.drip * 0.55,
            });
            this._spawnModule(pick, x, y, 0.42 + transientDrive * 0.6, time);
          }
        }

        this.ambient_clock += dt * (0.3 + this.depth * 0.95 + macro * 0.38 + sustainDrive * 1.7 + this.fracture_pulse * 1.9) * fractureFrequency;
        const ambientInterval = clamp((0.4 - this.fracture_pulse * 0.14) / fractureFrequency, 0.08, 0.55);
        if (this.ambient_clock > ambientInterval) {
          this.ambient_clock = 0;
          const [x, y] = this._randomPoint(0.61);
          const pick = this._weightedModule({
            bokeh: activeWeights.bokeh,
            bloom: activeWeights.bloom,
            ring: activeWeights.ring * 0.48,
            dust: (activeWeights.dust || 0) * 0.45,
            fiber: (activeWeights.fiber || 0) * 0.42,
          });
          this._spawnModule(pick, x, y, 0.44 + sustainDrive * 0.6 + this.fracture_pulse * 0.26, time);
        }
      } else {
        if (lanes.kickOnset > 0.5) {
          const [x, y] = this._randomPoint(0.74);
          if (this.isEffectEnabled("drip") && Math.random() < this.getEffectAmount("drip") * (0.55 + kickDrive * 0.45)) {
            this._spawnModule("drip", x + rand(-16, 16), y - rand(4, 22), 0.9 + kickDrive * 0.95, time);
          }
          if (this.isEffectEnabled("thermal") && Math.random() < this.getEffectAmount("thermal") * (0.52 + kickDrive * 0.42)) {
            this._spawnModule("thermal", x + rand(-14, 14), y + rand(-10, 10), 0.82 + kickDrive * 0.88, time);
          }
          if (this.isEffectEnabled("void") && Math.random() < 0.1 * this.getEffectAmount("void") * (0.5 + kickDrive * 0.5)) {
            this._spawnModule("void", x + rand(-28, 28), y + rand(-28, 28), 0.65 + kickDrive * 0.35, time);
          }
        }

        if (lanes.snareOnset > 0.5) {
          const [x, y] = this._randomPoint(0.66);
          const pick = this._weightedModule({
            ring: activeWeights.ring,
            frame: activeWeights.frame,
            stack: activeWeights.stack * 0.72,
            shear: (activeWeights.shear || 0) * 0.45,
          });
          this._spawnModule(pick, x, y, 0.64 + snareDrive * 0.72, time);
        }

        this.hat_clock += dt * (0.2 + hatDrive * 4.0 + high * 0.4);
        if (this.hat_clock > 0.14) {
          this.hat_clock = 0;
          if (Math.random() < (0.35 + hatDrive * 0.65)) {
            const [x, y] = this._randomPoint(0.58);
            const pick = this._weightedModule({
              dust: activeWeights.dust || 0,
              shear: activeWeights.shear || 0,
              fiber: (activeWeights.fiber || 0) * 0.45,
              ring: activeWeights.ring * 0.18,
            });
            this._spawnModule(pick, x, y, 0.24 + hatDrive * 0.46, time);
          }
        }

        this.ambient_clock += dt * (0.1 + this.depth * 0.45 + macro * 0.2 + sustainDrive * 1.2);
        if (this.ambient_clock > 0.55) {
          this.ambient_clock = 0;
          const [x, y] = this._randomPoint(0.64);
          const pick = this._weightedModule({
            bokeh: activeWeights.bokeh,
            bloom: activeWeights.bloom,
            fiber: (activeWeights.fiber || 0) * 0.45,
            ring: activeWeights.ring * 0.25,
          });
          this._spawnModule(pick, x, y, 0.3 + sustainDrive * 0.62 + this.depth * 0.2, time);
        }
      }
    } else {
      if (lowOnset) {
        const [x, y] = this._randomPoint(0.72);
        if (this.isEffectEnabled("bloom") && Math.random() < this.getEffectAmount("bloom")) {
          this._spawnModule("bloom", x, y, 0.9 + low * 0.38, time);
        }
        if (this.isEffectEnabled("void") && Math.random() < 0.22 * this.getEffectAmount("void")) {
          this._spawnModule("void", x, y, 0.78, time);
        }
      }

      if (midOnset) {
        const [x, y] = this._randomPoint(0.67);
        const pick = this._weightedModule({
          ring: activeWeights.ring,
          stack: activeWeights.stack,
          shear: activeWeights.shear || 0,
          frame: activeWeights.frame,
          spore: activeWeights.spore,
        });
        this._spawnModule(pick, x, y, 0.72 + mid * 0.38, time);
      }

      this.high_clock += dt * (0.18 + high * 1.25 + this.depth * 0.25);
      if (this.high_clock > 0.38) {
        this.high_clock = 0;
        const [x, y] = this._randomPoint(0.6);
        const pick = this._weightedModule({
          bokeh: activeWeights.bokeh,
          ring: activeWeights.ring * 0.5,
          spore: activeWeights.spore * 0.35,
          fiber: (activeWeights.fiber || 0) * 0.65,
          dust: activeWeights.dust || 0,
        });
        this._spawnModule(pick, x, y, 0.4 + high * 0.5, time);
      }

      this.ambient_clock += dt * (0.2 + this.depth * 0.9 + macro * 0.34);
      if (this.ambient_clock > 0.48) {
        this.ambient_clock = 0;
        const [x, y] = this._randomPoint(0.63);
        const pick = this._weightedModule(activeWeights);
        this._spawnModule(pick, x, y, 0.3 + this.depth * 0.4, time);
      }
    }

    if (!fractureModeActive) {
      this.fracture_pulse = Math.max(0, this.fracture_pulse * Math.exp(-dt * 7.5) - dt * 0.05);
      this.fracture_combo = Math.max(0, this.fracture_combo - dt * 1.1);
      this.fracture_invert *= Math.exp(-dt * 9.0);
      this.fracture_glitch *= Math.exp(-dt * 9.0);
    }

    if (macroShift) {
      this.last_macro_shift = time;
      if (Math.random() < 0.72) {
        const pool = ["mono_pink", "mono_blue", "pastel_multi", ...(Math.random() < 0.32 ? ["thermal"] : [])];
        this.palette_override = pool[Math.floor(Math.random() * pool.length)];
        this.palette_override_until = time + rand(4.8, 9.2);
      }
      if (Math.random() < 0.35) {
        const [x, y] = this._randomPoint(0.5);
        if (Math.random() < this.getEffectAmount("frame")) this._spawnModule("frame", x, y, 0.72, time);
      }
      if (Math.random() < 0.4) {
        const [x, y] = this._randomPoint(0.42);
        if (Math.random() < this.getEffectAmount("thermal")) this._spawnModule("thermal", x, y, 0.88, time);
      }
    }

    if (this.palette_override && time >= this.palette_override_until) {
      this.palette_override = null;
    }

    if (this.fracture_hold > 0) {
      this.fracture_hold = Math.max(0, this.fracture_hold - dt);
    }
    const holdNorm = this.fracture_duration > 0 ? this.fracture_hold / this.fracture_duration : 0;
    const holdAmp = clamp(holdNorm, 0, 1);
    this.fracture_rotation += this.fracture_rotation_vel * dt;
    this.fracture_rotation_vel *= Math.exp(-dt * (6.2 + this.fracture_pulse * 3.5));
    if (this.fracture_hold <= 0) {
      this.fracture_invert *= Math.exp(-dt * 11.0);
      this.fracture_glitch *= Math.exp(-dt * 12.0);
    }

    const fractureActive = fractureModeActive
      ? clamp(holdAmp * 0.75 + this.fracture_pulse * 0.42, 0, 1)
      : 0;
    const fractureInvert = clamp(this.fracture_invert * (0.45 + holdAmp * 0.55), 0, 1);
    const fractureGlitch = clamp(this.fracture_glitch * (0.4 + holdAmp * 0.6), 0, 1);
    const fractureRotation = clamp(this.fracture_rotation * (0.34 + holdAmp * 0.66), -1.2, 1.2);
    const lifecycleBoost = fractureModeActive
      ? clamp(1 + this.fracture_pulse * (2.2 + transientDrive * 1.3), 1, 5.5)
      : 1;
    const driftBoost = fractureModeActive ? (1 + this.fracture_pulse * 0.9) : 1;

    for (const ev of this.events) {
      const drift = (0.55 + ev.aux2 * 1.15) * (1.0 + ev.radius / Math.max(64, Math.min(this.width, this.height)));
      ev.x = clamp(ev.x + Math.sin(time * 0.24 + ev.seed * 13.0) * dt * drift * 18.0 * driftBoost, 0, this.width);
      ev.y = clamp(ev.y + Math.cos(time * 0.19 + ev.seed * 11.0) * dt * drift * 15.0 * driftBoost, 0, this.height);
    }

    this.events = this.events.filter((ev) => {
      const moduleName = this._eventModuleName(ev);
      const speed = this.getEffectSpeed(moduleName);
      ev.age += dt * speed * lifecycleBoost;
      return ev.age < ev.lifetime;
    });

    const maxCount = Math.floor(10 + this.depth * 36);
    while (this.events.length > maxCount) this.events.shift();

    return {
      low,
      mid,
      high,
      macro,
      lanes: {
        kick: clamp(lanes.kick || 0, 0, 1),
        snare: clamp(lanes.snare || 0, 0, 1),
        hat: clamp(lanes.hat || 0, 0, 1),
        sustain: clamp(lanes.sustain || 0, 0, 1),
        transient: clamp(lanes.transient || 0, 0, 1),
        kickOnset: lanes.kickOnset ? 1 : 0,
        snareOnset: lanes.snareOnset ? 1 : 0,
        hatOnset: lanes.hatOnset ? 1 : 0,
        transientOnset: lanes.transientOnset ? 1 : 0,
      },
      reactivityMode: this.reactivity_mode,
      fractureIntensity: this.fracture_intensity,
      fractureFrequency: this.fracture_frequency,
      fracture: {
        active: fractureActive,
        invert: fractureInvert,
        glitch: fractureGlitch,
        rotation: fractureRotation,
        seed: this.fracture_seed,
        pulse: this.fracture_pulse,
        combo: this.fracture_combo,
        rect: {
          cx: this.fracture_rect.cx,
          cy: this.fracture_rect.cy,
          w: this.fracture_rect.w,
          h: this.fracture_rect.h,
          feather: this.fracture_rect.feather,
        },
      },
    };
  }

  packUniformArrays() {
    const data0 = this._uniData0;
    const data1 = this._uniData1;
    const data2 = this._uniData2;
    const events = this.events;

    // Collect indices of enabled events (forward order, no allocation per item beyond array growth).
    if (!this._enabledIdx) this._enabledIdx = [];
    const enabledIdx = this._enabledIdx;
    enabledIdx.length = 0;
    for (let i = 0; i < events.length; i += 1) {
      if (this.isEffectEnabled(this._eventModuleName(events[i]))) enabledIdx.push(i);
    }
    const total = enabledIdx.length;
    const count = total < MAX_PLATES ? total : MAX_PLATES;
    const startIdx = total - count;

    for (let i = 0; i < count; i += 1) {
      const ev = events[enabledIdx[startIdx + i]];
      const ageNorm = Math.min(1, ev.age / Math.max(ev.lifetime, 1e-6));
      const base = i * 4;
      data0[base] = ev.x;
      data0[base + 1] = ev.y;
      data0[base + 2] = ev.radius;
      data0[base + 3] = ev.kind;
      data1[base] = ev.intensity;
      data1[base + 1] = ageNorm;
      data1[base + 2] = ev.seed;
      data1[base + 3] = ev.aux;
      data2[base] = ev.color[0];
      data2[base + 1] = ev.color[1];
      data2[base + 2] = ev.color[2];
      data2[base + 3] = ev.aux2;
    }
    this._uniPacked.count = count;
    return this._uniPacked;
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(gl, vert, frag) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "unknown program error";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

const FULLSCREEN_VERT = `#version 300 es
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const PLATE_FRAG = `#version 300 es
precision highp float;
precision highp int;

#define MAX_PLATES 64

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_depth;
uniform int u_plate_count;
uniform vec4 u_plate_data0[MAX_PLATES];
uniform vec4 u_plate_data1[MAX_PLATES];
uniform vec4 u_plate_data2[MAX_PLATES];

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float sdBox(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

vec2 rotate2d(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  vec2 frag = v_uv * u_resolution;
  float density = 0.0;
  vec3 ink = vec3(0.0);

  for (int i = 0; i < MAX_PLATES; i++) {
    if (i >= u_plate_count) break;

    vec4 d0 = u_plate_data0[i];
    vec4 d1 = u_plate_data1[i];
    vec4 d2 = u_plate_data2[i];

    vec2 center = d0.xy;
    float radius = max(1.0, d0.z);
    int kind = int(d0.w + 0.5);

    float intensity = d1.x;
    float age_norm = d1.y;
    float seed = d1.z;
    float aux = d1.w;
    float aux2 = d2.a;

    vec3 color = d2.rgb;

    float attack_end = 0.26;
    float release_start = 0.68;
    float release_end = 0.86;
    float dissolve_start = 0.68;
    float collapse_end = 0.76;

    // Per-effect envelope for better music-reactive readability.
    if (kind == 5 || kind == 4) { // DRIP / THERMAL: fast hit + long release.
      attack_end = 0.12;
      release_start = 0.58;
      release_end = 0.94;
      dissolve_start = 0.74;
      collapse_end = 0.84;
    } else if (kind == 1 || kind == 6 || kind == 9) { // RING / FRAME / SHEAR: short pulse.
      attack_end = 0.08;
      release_start = 0.42;
      release_end = 0.72;
      dissolve_start = 0.46;
      collapse_end = 0.66;
    } else if (kind == 8) { // DUST: very short transient.
      attack_end = 0.05;
      release_start = 0.3;
      release_end = 0.6;
      dissolve_start = 0.42;
      collapse_end = 0.62;
    } else if (kind == 2 || kind == 0) { // BOKEH / BLOOM: slower breathe.
      attack_end = 0.2;
      release_start = 0.62;
      release_end = 0.9;
      dissolve_start = 0.7;
      collapse_end = 0.8;
    }

    float fade_in = smoothstep(0.0, attack_end, age_norm);
    float exit_phase = smoothstep(release_start, release_end, age_norm);
    float fade_out = 1.0 - exit_phase;
    float life = fade_in * fade_out;
    if (life <= 0.001) continue;

    vec2 p = frag - center;
    float dissolveNoise = noise21(p / max(radius, 1.0) * 5.1 + vec2(seed * 13.0, seed * 7.0) + vec2(u_time * 0.35));
    float dissolve_mix = smoothstep(dissolve_start, 0.98, age_norm);
    float dissolve = mix(1.0, smoothstep(0.12, 0.95, dissolveNoise), dissolve_mix);
    life *= dissolve;

    float appearScale = mix(0.7, 1.0, fade_in);
    float disappearScale = mix(1.0, collapse_end, exit_phase);
    radius *= appearScale * disappearScale;

    float dist_c = length(p);
    float contribution = 0.0;

    if (kind == 0) {
      float core = exp(-pow(dist_c / (radius * 0.36), 2.0));
      float haze = exp(-pow(dist_c / (radius * 1.2), 2.0));
      float mist = noise21(p / max(radius, 1.0) * 4.3 + seed * 11.0 + u_time * 0.06);
      float grain = step(0.86, noise21(p / max(radius, 1.0) * 13.0 + seed * 37.0));
      contribution = core * 1.08 + haze * (0.46 + mist * 0.34) + grain * (0.05 + aux2 * 0.1) * haze;
    }

    if (kind == 1) {
      float ring_levels = mix(4.0, 18.0, clamp(aux + u_depth * 0.32, 0.0, 1.0));
      float radial = dist_c / max(radius, 1.0);
      float wobble = sin(radial * 10.0 + seed * 8.0) * (0.04 + aux2 * 0.08);
      float contour = exp(-abs(dist_c - radius * (1.0 + wobble)) / (radius * (0.02 + aux2 * 0.03)));
      float bands = 0.5 + 0.5 * sin(radial * ring_levels * 6.28318 + seed * (8.0 + aux2 * 5.0));
      contribution = contour * (0.42 + 0.68 * bands);
    }

    if (kind == 2) {
      float softness = mix(0.2, 0.95, aux2);
      float orb = exp(-pow(dist_c / (radius * mix(0.65, 1.1, softness)), 2.0));
      float radial = dist_c / max(radius, 1.0);
      float band = 0.5 + 0.5 * sin(radial * (4.0 + aux * 9.0) * 6.28318 + seed * 3.0);
      float ring = exp(-pow(abs(dist_c - radius * mix(0.45, 0.72, aux)) / (radius * 0.09), 2.0));
      contribution = orb * (0.62 + 0.32 * band) + ring * (0.24 + aux * 0.25);
    }

    if (kind == 3) {
      float ang = atan(p.y, p.x);
      float sp = sin(ang * (14.0 + aux * 24.0) + seed * 13.0);
      float gn = noise21(vec2(ang * 2.6, dist_c / max(radius, 1.0) * 3.8 + seed * 2.7));
      float rr = radius * (1.0 + (sp * 0.13 + (gn - 0.5) * (0.16 + aux2 * 0.2)));
      float sd = dist_c - rr;
      float body = smoothstep(radius * 0.24, -radius * 0.24, sd);
      float fringe = exp(-abs(sd) / (radius * (0.02 + aux * 0.03)));
      contribution = body * 0.45 + fringe * 0.84;
    }

    if (kind == 4) {
      float shift = mix(0.01, 0.08, aux2);
      float edge = exp(-abs(dist_c - radius) / (radius * (0.016 + aux * 0.02)));
      float halo = exp(-abs(dist_c - radius * (1.08 + shift)) / (radius * 0.035));
      float inner = exp(-abs(dist_c - radius * (0.88 - shift)) / (radius * 0.03));
      contribution = edge * 1.35 + halo * 0.58 + inner * 0.38;
    }

    if (kind == 5) {
      int count = int(mix(3.0, 11.0, aux));
      float chain = 0.0;
      vec2 rp = rotate2d(p, sin(seed * 7.0) * 0.06);
      for (int j = 0; j < 11; j++) {
        if (j >= count) break;
        float jf = float(j);
        float rr = radius * mix(1.0, 0.42, jf / max(1.0, float(count - 1)));
        float jitter = (sin(seed * 17.0 + jf) * 0.3 + cos(seed * 13.0 + jf * 1.7) * 0.2) * aux2;
        vec2 c = vec2(jitter * radius * 0.45, jf * radius * 0.58);
        float dj = length(rp - c) - rr;
        chain += smoothstep(rr * 0.26, -rr * 0.24, dj);
      }
      contribution = chain;
    }

    if (kind == 6) {
      float rot = seed * 3.14159 * 0.35;
      vec2 rp = rotate2d(p, rot);
      vec2 half_size = vec2(radius * 1.36, radius * (0.85 + aux * 0.7));
      float box_sd = sdBox(rp, half_size);
      float thickness = radius * mix(0.012, 0.04, aux2);
      float border = exp(-abs(box_sd) / max(1e-4, thickness));
      contribution = border * 0.95;
      vec2 hp = rp + vec2(radius * 0.7, -radius * 0.35);
      float hole = smoothstep(radius * 0.08, 0.0, length(hp));
      contribution *= (1.0 - hole * 0.55);
    }

    if (kind == 7) {
      float hole = smoothstep(radius, 0.0, dist_c);
      density -= hole * intensity * life * (1.7 + aux2 * 0.4);
      ink *= (1.0 - hole * (0.86 + aux2 * 0.12) * intensity * life);
      continue;
    }

    if (kind == 8) {
      vec2 rp = p / max(radius, 1.0);
      vec2 grid = rp * (16.0 + aux * 30.0) + vec2(seed * 23.0, seed * 41.0);
      vec2 cid = floor(grid);
      vec2 local = fract(grid) - 0.5;
      float clusterA = noise21(cid * 0.19 + vec2(seed * 17.0, seed * 29.0));
      float clusterB = noise21(rp * 2.6 + vec2(seed * 9.0, -seed * 7.0));
      float cluster = smoothstep(0.35, 0.9, clusterA * 0.7 + clusterB * 0.3);
      float dotMask = step(0.8 - cluster * 0.38, hash12(cid + seed * 13.0));
      float core = smoothstep(0.24 + (1.0 - cluster) * 0.11 + aux2 * 0.08, 0.0, length(local));
      float halo = smoothstep(0.46 + aux2 * 0.18, 0.0, length(local));
      float flock = 0.45 + 0.55 * cluster;
      float falloff = smoothstep(1.25, 0.0, length(rp));
      contribution = dotMask * (core * 1.25 + halo * 0.4 * cluster) * falloff * flock * (0.42 + aux * 0.9);
    }

    if (kind == 9) {
      float angle = seed * 6.28318 + (aux2 - 0.5) * 1.3;
      vec2 rp = rotate2d(p, angle);
      float longAxis = radius * mix(1.6, 3.2, aux);
      float shortAxis = radius * mix(0.12, 0.45, aux2);
      vec2 q = vec2(rp.x / max(1.0, longAxis), rp.y / max(1.0, shortAxis));
      float body = exp(-dot(q, q));
      float tail = exp(-pow(max(0.0, rp.x) / max(1.0, longAxis * 1.8), 2.0)) * exp(-pow(rp.y / max(1.0, shortAxis * 0.8), 2.0));
      float streak = 0.5 + 0.5 * noise21(vec2(rp.x / max(1.0, radius * 0.7), rp.y / max(1.0, radius * 0.25)) + seed * 7.0);
      contribution = (body * 0.65 + tail * 0.6) * mix(0.6, 1.25, streak);
    }

    if (kind == 10) {
      float angle = seed * 6.28318;
      vec2 rp = rotate2d(p, angle);
      float nx = rp.x / max(1.0, radius * 2.2);
      float ny = rp.y / max(1.0, radius);
      float thickness = mix(0.012, 0.048, aux2);
      float center = exp(-abs(ny) / max(1e-4, thickness));
      float sideA = exp(-abs(ny - 0.06) / max(1e-4, thickness * 1.4)) * 0.28;
      float sideB = exp(-abs(ny + 0.06) / max(1e-4, thickness * 1.4)) * 0.28;
      float env = exp(-abs(nx) * 1.25);
      float grain = noise21(vec2(nx * 22.0 + seed * 7.0, ny * 11.0 + seed * 5.0));
      float breakup = 0.72 + 0.28 * smoothstep(0.2, 0.9, grain);
      float nodes = step(0.9, noise21(vec2(nx * 34.0 + seed * 13.0, seed * 3.0))) * 0.32;
      contribution = (center + sideA + sideB) * env * breakup + nodes * env;
    }

    float amount = contribution * intensity * life;
    density += amount;
    ink += color * amount;
  }

  float air = noise21(v_uv * u_resolution * 0.72 + vec2(u_time * 0.03, u_time * 0.01)) - 0.5;
  density = max(0.0, density + air * 0.015);
  ink += air * 0.014;

  fragColor = vec4(max(ink, vec3(0.0)), density);
}`;

const COMPOSITE_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_accum_tex;
uniform vec2 u_resolution;
uniform vec2 u_accum_resolution;
uniform float u_time;
uniform float u_paper_grain;
uniform float u_bg_tone;
uniform float u_thermal_boost;
uniform float u_exposure;
uniform float u_bloom_strength;
uniform float u_blur_strength;
uniform float u_global_opacity;
uniform float u_depth;
uniform float u_contrast;
uniform float u_overlap_emphasis;
uniform float u_paper_white;
uniform vec3 u_paper_tint;
uniform vec4 u_fracture_rect;
uniform vec4 u_fracture_fx;
uniform vec2 u_fracture_meta;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 rotateAround(vec2 uv, vec2 center, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  vec2 p = uv - center;
  return center + vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float rectMask(vec2 uv, vec2 center, vec2 halfSize, float feather) {
  vec2 d = abs(uv - center) - halfSize;
  float outside = max(d.x, d.y);
  return 1.0 - smoothstep(0.0, max(0.0001, feather), outside);
}

vec4 sampleAccum(vec2 uv, float spread) {
  vec2 o = spread / u_accum_resolution;
  vec4 c = texture(u_accum_tex, uv) * 0.36;
  c += texture(u_accum_tex, uv + vec2( o.x,  0.0)) * 0.16;
  c += texture(u_accum_tex, uv + vec2(-o.x,  0.0)) * 0.16;
  c += texture(u_accum_tex, uv + vec2( 0.0,  o.y)) * 0.16;
  c += texture(u_accum_tex, uv + vec2( 0.0, -o.y)) * 0.16;
  return c;
}

void main() {
  float blurStrength = clamp(u_blur_strength, 0.0, 2.5);
  float blurMix = clamp(blurStrength * 0.42, 0.0, 0.92);
  float blurSpread = mix(0.65, 3.8, blurStrength / 2.5);
  vec4 accRaw = texture(u_accum_tex, v_uv);
  vec4 accSoft = sampleAccum(v_uv, blurSpread);
  vec4 acc = mix(accRaw, accSoft, blurMix);
  vec2 texel = 1.0 / u_accum_resolution;

  float d = max(0.0, acc.a);

  float dx = texture(u_accum_tex, v_uv + vec2(texel.x * 2.0, 0.0)).a - texture(u_accum_tex, v_uv - vec2(texel.x * 2.0, 0.0)).a;
  float dy = texture(u_accum_tex, v_uv + vec2(0.0, texel.y * 2.0)).a - texture(u_accum_tex, v_uv - vec2(0.0, texel.y * 2.0)).a;
  float edge = smoothstep(0.012, 0.14, length(vec2(dx, dy)));

  float paperWhite = clamp(u_paper_white, 0.0, 1.0);
  vec3 paperBase = mix(u_paper_tint * 0.72, u_paper_tint, paperWhite);
  vec3 paper = paperBase * u_bg_tone;
  float bgTextureMask = smoothstep(0.0, 0.2, u_bg_tone);

  float fiberA = noise21(v_uv * u_resolution * 1.22 + vec2(31.2, -17.9));
  float fiberB = noise21(v_uv * u_resolution * 2.91 + vec2(-16.7, 23.6));
  float fiberC = noise21(v_uv * u_resolution * 5.34 + vec2(8.2, 91.5));
  float paperFiber = (fiberA * 0.5 + fiberB * 0.34 + fiberC * 0.16) - 0.5;
  paper += paperFiber * (0.05 + u_depth * 0.012) * u_paper_grain * bgTextureMask;

  vec3 ink = max(acc.rgb, vec3(0.0));
  vec3 film = 1.0 - exp(-ink * u_exposure * max(0.2, u_global_opacity));

  vec3 screenBlend = 1.0 - (1.0 - paper) * (1.0 - film * 0.97);
  vec3 multiplyBlend = paper * (1.0 - film * (0.32 + u_depth * 0.08));

  float densityMask = clamp(d * (0.7 + u_global_opacity * 0.18), 0.0, 1.0);
  vec3 color = mix(paper, screenBlend, densityMask);
  color = mix(color, multiplyBlend, clamp(d * 0.25, 0.0, 0.48));

  // Boost overlapping regions so stacked effects read more clearly.
  float overlap = smoothstep(0.18, 0.78, d);
  float overlapEdge = overlap * (0.55 + 0.75 * edge);
  float overlapStrength = max(0.0, u_overlap_emphasis);
  color -= vec3(0.18) * overlapEdge * overlapStrength;
  color += vec3(0.06) * overlap * (1.0 - edge) * (1.0 - paperWhite) * overlapStrength;

  vec3 thermalA = vec3(0.21, 0.93, 1.0);
  vec3 thermalB = vec3(1.0, 0.43, 0.64);
  vec3 thermalC = vec3(1.0, 0.67, 0.28);
  float sweep = 0.5 + 0.5 * sin(v_uv.y * 19.0 + u_time * 0.7);
  vec3 thermal = mix(thermalA, thermalB, sweep);
  thermal = mix(thermal, thermalC, 0.34 + 0.26 * sin(v_uv.x * 13.0 - u_time * 0.41));

  float chromaShift = 1.8 + u_depth * 4.2;
  float edgeR = texture(u_accum_tex, v_uv + texel * vec2(chromaShift, 0.0)).a;
  float edgeB = texture(u_accum_tex, v_uv - texel * vec2(chromaShift, 0.0)).a;
  vec3 chromaEdge = vec3(edgeR, edge, edgeB);

  color += thermal * edge * u_thermal_boost * 0.38;
  color += (chromaEdge - vec3(edge)) * u_thermal_boost * 0.26;

  float hazeSpread = mix(0.8, 2.2, blurStrength / 2.5);
  vec4 blur1 = texture(u_accum_tex, v_uv + vec2(texel.x * 4.0 * hazeSpread, texel.y * 3.0 * hazeSpread));
  vec4 blur2 = texture(u_accum_tex, v_uv - vec2(texel.x * 3.0 * hazeSpread, texel.y * 4.0 * hazeSpread));
  vec4 blur3 = texture(u_accum_tex, v_uv + vec2(texel.x * 7.0 * hazeSpread, -texel.y * 5.0 * hazeSpread));
  float haze = (blur1.a + blur2.a + blur3.a) / 3.0;
  color += vec3(1.0, 0.98, 1.0) * smoothstep(0.08, 0.72, haze) * (0.03 + u_depth * 0.02) * mix(0.38, 1.0, paperWhite);

  float bloomStrength = clamp(u_bloom_strength, 0.0, 2.5);
  vec4 bloomWide = sampleAccum(v_uv, blurSpread * 2.2);
  float bloomMask = smoothstep(0.09, 0.88, bloomWide.a);
  color += vec3(0.22) * bloomMask * bloomStrength * (0.55 + 0.45 * paperWhite);
  color += vec3(0.12) * edge * bloomStrength * bloomMask;

  float micro = hash12(gl_FragCoord.xy + u_time * 61.0) - 0.5;
  color += micro * (0.02 + u_depth * 0.015) * u_paper_grain * bgTextureMask;

  // Dense clustered dot layer inspired by paper-like speck aggregation.
  vec2 dotGrid = v_uv * u_resolution * 0.62;
  vec2 dotId = floor(dotGrid);
  vec2 dotLocal = fract(dotGrid) - 0.5;
  float dotClusterA = noise21(dotId * 0.13 + vec2(17.2, -9.6));
  float dotClusterB = noise21(v_uv * u_resolution * 0.09 + vec2(-4.1, 21.3));
  float dotCluster = smoothstep(0.34, 0.9, dotClusterA * 0.7 + dotClusterB * 0.3);
  float dotGate = step(0.7 - dotCluster * 0.3, hash12(dotId + 41.7));
  float dotShape = smoothstep(0.28 + (1.0 - dotCluster) * 0.12, 0.0, length(dotLocal));
  float dotCloud = dotGate * dotShape;
  float dotStrength = (0.05 + u_paper_grain * 0.11) * (0.75 + u_depth * 0.35) * bgTextureMask;
  color += vec3(0.16) * dotCloud * dotStrength;
  color -= vec3(0.09) * dotCloud * smoothstep(0.08, 0.65, d) * dotStrength;

  float softVignette = smoothstep(1.35, 0.45, length(v_uv - 0.5));
  color = mix(paper, color, softVignette * mix(0.82, 1.0, paperWhite));

  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float bw = (luma - 0.5) * u_contrast + 0.5;
  // Tone remap for dense overlap: lift deep blacks back into mid-gray range.
  float overlapToneMask = smoothstep(0.55, 1.1, d) * clamp(u_overlap_emphasis * 0.65, 0.0, 1.0);
  float shadowFocus = smoothstep(0.6, 0.05, bw);
  float reboundTarget = 0.34 + bw * 0.3;
  bw = mix(bw, reboundTarget, overlapToneMask * shadowFocus);

  float fractureActive = clamp(u_fracture_fx.w, 0.0, 1.0);
  if (fractureActive > 0.001) {
    vec2 rectCenter = u_fracture_rect.xy;
    vec2 rectHalf = max(vec2(0.02), u_fracture_rect.zw * 0.5);
    float regionMask = rectMask(v_uv, rectCenter, rectHalf, clamp(u_fracture_meta.y, 0.01, 0.22));

    float sliceLines = 10.0 + u_fracture_fx.y * 30.0;
    float sliceId = floor((v_uv.y + u_fracture_meta.x * 0.017) * sliceLines);
    float sliceNoise = hash12(vec2(sliceId, floor(u_time * 38.0 + u_fracture_meta.x * 0.27)));
    float sliceShift = (sliceNoise - 0.5) * (0.02 + u_fracture_fx.y * 0.06);
    vec2 glitchUv = vec2(clamp(v_uv.x + sliceShift * regionMask, 0.001, 0.999), clamp(v_uv.y, 0.001, 0.999));
    vec2 rotatedUv = rotateAround(glitchUv, rectCenter, u_fracture_fx.z);
    rotatedUv = clamp(rotatedUv, vec2(0.001), vec2(0.999));

    vec4 rotatedAcc = sampleAccum(rotatedUv, blurSpread * (1.0 + u_fracture_fx.y * 0.35));
    float rotatedDensity = max(0.0, rotatedAcc.a);
    vec3 rotatedInk = max(rotatedAcc.rgb, vec3(0.0));
    vec3 rotatedFilm = 1.0 - exp(-rotatedInk * u_exposure * max(0.2, u_global_opacity));
    vec3 rotatedScreen = 1.0 - (1.0 - paper) * (1.0 - rotatedFilm * 0.97);
    float rotatedMask = clamp(rotatedDensity * (0.72 + u_global_opacity * 0.18), 0.0, 1.0);
    vec3 rotatedColor = mix(paper, rotatedScreen, rotatedMask);
    float rotatedLuma = dot(rotatedColor, vec3(0.2126, 0.7152, 0.0722));
    float rotatedBw = clamp((rotatedLuma - 0.5) * u_contrast + 0.5, 0.0, 1.0);

    float glitchGate = step(0.5, hash12(vec2(sliceId + floor(u_time * 15.0), u_fracture_meta.x * 11.0)));
    float regionAmount = regionMask * fractureActive * (0.55 + 0.45 * glitchGate);
    float invertMix = clamp(u_fracture_fx.x * (0.6 + 0.4 * glitchGate), 0.0, 1.0);
    float fracturedBw = mix(rotatedBw, 1.0 - rotatedBw, invertMix);
    bw = mix(bw, fracturedBw, clamp(regionAmount * (0.3 + u_fracture_fx.y * 0.75), 0.0, 1.0));
  }

  bw = clamp(bw, 0.0, 1.0);
  fragColor = vec4(vec3(bw), 1.0);
}`;

class StrataWebApp {
  constructor() {
    this.canvas = document.getElementById("stage");
    this.panel = document.getElementById("panel");

    const gl = this.canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 is required.");
    this.gl = gl;

    this.renderScale = DEFAULT_VISUAL_STATE.renderScale;
    this.lastTime = performance.now() * 0.001;
    this._lastFrameMs = 0;
    this._lastLaneUiMs = 0;
    this._lastRuntimeTextMs = 0;
    this.simTime = 0;
    this.isPaused = false;
    this.rhythm = {
      low: 0,
      mid: 0,
      high: 0,
      macro: 0,
      lanes: { ...EMPTY_AUDIO_LANES },
      reactivityMode: REACTIVITY_MODE.CLASSIC,
      fractureIntensity: 1.0,
      fractureFrequency: 1.0,
      fracture: {
        active: 0,
        invert: 0,
        glitch: 0,
        rotation: 0,
        seed: 0,
        pulse: 0,
        combo: 0,
        rect: { cx: 0.5, cy: 0.5, w: 0.2, h: 0.2, feather: 0.08 },
      },
    };
    this.audioLaneUi = null;
    this.laneSensitivityUi = null;
    this.lanePulseHold = { kick: 0, snare: 0, hat: 0, sustain: 0 };
    this.savedVisualPresets = {};
    this.activeSavedPresetName = "";
    this.inputMode = "random";
    this.audioInput = new AudioInputController();

    this._buildGL();
    this.scheduler = new StrataScheduler(1, 1);
    this._bindUI();
    this._resize();

    window.addEventListener("resize", () => this._resize());
    window.addEventListener("keydown", (e) => this._handleKey(e));
    document.addEventListener("fullscreenchange", () => this._setFullscreenUi());
    window.addEventListener("beforeunload", () => this.audioInput.stop());

    requestAnimationFrame((t) => this._loop(t));
  }

  _buildGL() {
    const gl = this.gl;

    this.progPlate = createProgram(gl, FULLSCREEN_VERT, PLATE_FRAG);
    this.progComp = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);

    this.uniformPlate = {
      u_resolution: gl.getUniformLocation(this.progPlate, "u_resolution"),
      u_time: gl.getUniformLocation(this.progPlate, "u_time"),
      u_depth: gl.getUniformLocation(this.progPlate, "u_depth"),
      u_plate_count: gl.getUniformLocation(this.progPlate, "u_plate_count"),
      u_plate_data0: gl.getUniformLocation(this.progPlate, "u_plate_data0[0]"),
      u_plate_data1: gl.getUniformLocation(this.progPlate, "u_plate_data1[0]"),
      u_plate_data2: gl.getUniformLocation(this.progPlate, "u_plate_data2[0]"),
    };

    this.uniformComp = {
      u_accum_tex: gl.getUniformLocation(this.progComp, "u_accum_tex"),
      u_resolution: gl.getUniformLocation(this.progComp, "u_resolution"),
      u_accum_resolution: gl.getUniformLocation(this.progComp, "u_accum_resolution"),
      u_time: gl.getUniformLocation(this.progComp, "u_time"),
      u_paper_grain: gl.getUniformLocation(this.progComp, "u_paper_grain"),
      u_bg_tone: gl.getUniformLocation(this.progComp, "u_bg_tone"),
      u_thermal_boost: gl.getUniformLocation(this.progComp, "u_thermal_boost"),
      u_exposure: gl.getUniformLocation(this.progComp, "u_exposure"),
      u_bloom_strength: gl.getUniformLocation(this.progComp, "u_bloom_strength"),
      u_blur_strength: gl.getUniformLocation(this.progComp, "u_blur_strength"),
      u_global_opacity: gl.getUniformLocation(this.progComp, "u_global_opacity"),
      u_depth: gl.getUniformLocation(this.progComp, "u_depth"),
      u_contrast: gl.getUniformLocation(this.progComp, "u_contrast"),
      u_overlap_emphasis: gl.getUniformLocation(this.progComp, "u_overlap_emphasis"),
      u_paper_white: gl.getUniformLocation(this.progComp, "u_paper_white"),
      u_paper_tint: gl.getUniformLocation(this.progComp, "u_paper_tint"),
      u_fracture_rect: gl.getUniformLocation(this.progComp, "u_fracture_rect"),
      u_fracture_fx: gl.getUniformLocation(this.progComp, "u_fracture_fx"),
      u_fracture_meta: gl.getUniformLocation(this.progComp, "u_fracture_meta"),
    };

    this.quadVao = gl.createVertexArray();
    gl.bindVertexArray(this.quadVao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.accumTex = gl.createTexture();
    this.accumFbo = gl.createFramebuffer();

    this.floatFbo = !!gl.getExtension("EXT_color_buffer_float");
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;

    this.scheduler.resize(width, height);
    this._createAccumTarget();
  }

  _createAccumTarget() {
    const gl = this.gl;
    this.accumWidth = Math.max(64, Math.floor(this.canvas.width * this.renderScale));
    this.accumHeight = Math.max(64, Math.floor(this.canvas.height * this.renderScale));

    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (this.floatFbo) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.accumWidth, this.accumHeight, 0, gl.RGBA, gl.HALF_FLOAT, null);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.accumWidth, this.accumHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.accumFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.accumTex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer incomplete: ${status}`);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  _bindUI() {
    this.runtimeText = document.getElementById("runtimeText");
    this.presetSelect = document.getElementById("presetSelect");
    this.inputModeSelect = document.getElementById("inputModeSelect");
    this.audioReactiveModeSelect = document.getElementById("audioReactiveMode");
    this.fractureIntensityInput = document.getElementById("fractureIntensity");
    this.fractureIntensityValue = document.getElementById("fractureIntensityValue");
    this.fractureFrequencyInput = document.getElementById("fractureFrequency");
    this.fractureFrequencyValue = document.getElementById("fractureFrequencyValue");
    this.micStatus = document.getElementById("micStatus");

    for (const name of this.scheduler.preset_names) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      this.presetSelect.appendChild(opt);
    }
    this.presetSelect.value = this.scheduler.presetName;
    this.presetSelect.addEventListener("change", () => {
      this.scheduler.setPresetByName(this.presetSelect.value);
      this._syncUIValues();
    });
    this.inputModeSelect.value = this.inputMode;
    this.inputModeSelect.addEventListener("change", async () => {
      await this._setInputMode(this.inputModeSelect.value);
    });
    if (this.audioReactiveModeSelect) {
      this.audioReactiveModeSelect.value = this.scheduler.getReactivityMode();
      this.audioReactiveModeSelect.addEventListener("change", () => {
        this.scheduler.setReactivityMode(this.audioReactiveModeSelect.value);
        this._syncFractureModeUI();
      });
    }
    if (this.fractureIntensityInput) {
      const intensity = this.scheduler.getFractureIntensity();
      this.fractureIntensityInput.value = String(intensity);
      if (this.fractureIntensityValue) this.fractureIntensityValue.textContent = intensity.toFixed(2);
      this.fractureIntensityInput.addEventListener("input", () => {
        const next = this.scheduler.setFractureIntensity(Number(this.fractureIntensityInput.value));
        this.fractureIntensityInput.value = String(next);
        if (this.fractureIntensityValue) this.fractureIntensityValue.textContent = next.toFixed(2);
      });
    }
    if (this.fractureFrequencyInput) {
      const frequency = this.scheduler.getFractureFrequency();
      this.fractureFrequencyInput.value = String(frequency);
      if (this.fractureFrequencyValue) this.fractureFrequencyValue.textContent = frequency.toFixed(2);
      this.fractureFrequencyInput.addEventListener("input", () => {
        const next = this.scheduler.setFractureFrequency(Number(this.fractureFrequencyInput.value));
        this.fractureFrequencyInput.value = String(next);
        if (this.fractureFrequencyValue) this.fractureFrequencyValue.textContent = next.toFixed(2);
      });
    }
    this._syncFractureModeUI();
    this._setInputStatus("Input: Random");
    this._bindAudioLaneUI();

    this.effectToggleGrid = document.getElementById("effectToggleGrid");
    this.effectCheckboxes = {};
    this.effectAmountSliders = {};
    this.effectAmountOutputs = {};
    this.effectSpeedSliders = {};
    this.effectSpeedOutputs = {};
    if (this.effectToggleGrid) {
      const findCheckbox = (key) => this.effectToggleGrid.querySelector(`input[type="checkbox"][data-effect-key="${key}"]`);
      for (const key of EFFECT_TOGGLE_KEYS) {
        let input = findCheckbox(key);
        let item = input ? input.closest(".effect-toggle-item") : null;
        if (!input) {
          item = document.createElement("label");
          item.className = "effect-toggle-item";
          input = document.createElement("input");
          input.type = "checkbox";
          input.dataset.effectKey = key;
          const text = document.createElement("span");
          text.className = "effect-toggle-label";
          text.textContent = EFFECT_TOGGLE_LABELS[key] || key;
          item.appendChild(input);
          item.appendChild(text);
          this.effectToggleGrid.appendChild(item);
        } else {
          input.dataset.effectKey = key;
          if (!item) {
            item = document.createElement("label");
            item.className = "effect-toggle-item";
            input.parentElement?.insertBefore(item, input);
            item.appendChild(input);
          }
          if (item) {
            let text = item.querySelector(".effect-toggle-label");
            if (!text) text = item.querySelector("span");
            if (!text) {
              text = document.createElement("span");
              item.appendChild(text);
            }
            text.className = "effect-toggle-label";
            text.textContent = EFFECT_TOGGLE_LABELS[key] || key;
          }
        }
        input.checked = this.scheduler.isEffectEnabled(key);
        input.addEventListener("change", () => {
          this.scheduler.setEffectEnabled(key, input.checked);
        });

        let amountWrap = item ? item.querySelector(".effect-amount") : null;
        let amountInput = amountWrap ? amountWrap.querySelector(`input[type="range"][data-effect-amount-key="${key}"]`) : null;
        let amountOut = amountWrap ? amountWrap.querySelector(".effect-amount-value") : null;

        if (!amountWrap || !amountInput || !amountOut) {
          if (amountWrap) amountWrap.remove();
          amountWrap = document.createElement("div");
          amountWrap.className = "effect-amount";
          amountInput = document.createElement("input");
          amountInput.type = "range";
          amountInput.min = "0";
          amountInput.max = "1";
          amountInput.step = "0.01";
          amountInput.dataset.effectAmountKey = key;
          amountOut = document.createElement("span");
          amountOut.className = "effect-amount-value";
          amountWrap.appendChild(amountInput);
          amountWrap.appendChild(amountOut);
          if (item) item.appendChild(amountWrap);
        }

        const amount = this.scheduler.getEffectAmount(key);
        amountInput.value = String(amount);
        amountOut.textContent = amount.toFixed(2);
        amountInput.addEventListener("input", () => {
          const v = clamp(Number(amountInput.value) || 0, 0, 1);
          this.scheduler.setEffectAmount(key, v);
          amountOut.textContent = v.toFixed(2);
        });

        let speedWrap = item ? item.querySelector(".effect-speed") : null;
        let speedInput = speedWrap ? speedWrap.querySelector(`input[type="range"][data-effect-speed-key="${key}"]`) : null;
        let speedOut = speedWrap ? speedWrap.querySelector(".effect-speed-value") : null;

        if (!speedWrap || !speedInput || !speedOut) {
          if (speedWrap) speedWrap.remove();
          speedWrap = document.createElement("div");
          speedWrap.className = "effect-speed";
          speedInput = document.createElement("input");
          speedInput.type = "range";
          speedInput.min = String(EFFECT_SPEED_BOUNDS[0]);
          speedInput.max = String(EFFECT_SPEED_BOUNDS[1]);
          speedInput.step = "0.01";
          speedInput.dataset.effectSpeedKey = key;
          speedOut = document.createElement("span");
          speedOut.className = "effect-speed-value";
          speedWrap.appendChild(speedInput);
          speedWrap.appendChild(speedOut);
          if (item) item.appendChild(speedWrap);
        }

        const speed = this.scheduler.getEffectSpeed(key);
        speedInput.value = String(speed);
        speedOut.textContent = `S:${speed.toFixed(2)}x`;
        speedInput.addEventListener("input", () => {
          const v = clamp(Number(speedInput.value) || 1, EFFECT_SPEED_BOUNDS[0], EFFECT_SPEED_BOUNDS[1]);
          this.scheduler.setEffectSpeed(key, v);
          speedOut.textContent = `S:${v.toFixed(2)}x`;
        });

        this.effectCheckboxes[key] = input;
        this.effectAmountSliders[key] = amountInput;
        this.effectAmountOutputs[key] = amountOut;
        this.effectSpeedSliders[key] = speedInput;
        this.effectSpeedOutputs[key] = speedOut;
      }
    }

    this.controls = [
      { id: "renderScale", valueId: "renderScaleValue", get: () => this.renderScale, set: (v) => { this.renderScale = v; this._createAccumTarget(); } },
      { id: "contrast", valueId: "contrastValue", get: () => this.scheduler.contrast, set: (v) => { this.scheduler.contrast = v; } },
      { id: "paperWhite", valueId: "paperWhiteValue", get: () => this.scheduler.paper_white, set: (v) => { this.scheduler.paper_white = v; } },
      { id: "backgroundTone", valueId: "backgroundToneValue", get: () => this.scheduler.background_tone, set: (v) => { this.scheduler.background_tone = v; } },
      { id: "paperGrain", valueId: "paperGrainValue", get: () => this.scheduler.paper_grain, set: (v) => { this.scheduler.paper_grain = v; } },
      { id: "exposure", valueId: "exposureValue", get: () => this.scheduler.exposure, set: (v) => { this.scheduler.exposure = v; } },
      { id: "bloomStrength", valueId: "bloomStrengthValue", get: () => this.scheduler.bloom_strength, set: (v) => { this.scheduler.bloom_strength = v; } },
      { id: "blurStrength", valueId: "blurStrengthValue", get: () => this.scheduler.blur_strength, set: (v) => { this.scheduler.blur_strength = v; } },
      { id: "overlapEmphasis", valueId: "overlapEmphasisValue", get: () => this.scheduler.overlap_emphasis, set: (v) => { this.scheduler.overlap_emphasis = v; } },
      { id: "thermalBoost", valueId: "thermalBoostValue", get: () => this.scheduler.thermal_boost, set: (v) => { this.scheduler.thermal_boost = v; } },
      { id: "opacity", valueId: "opacityValue", get: () => this.scheduler.global_opacity, set: (v) => { this.scheduler.global_opacity = v; } },
    ];

    for (const control of this.controls) {
      const el = document.getElementById(control.id);
      const out = document.getElementById(control.valueId);
      el.value = String(control.get());
      out.textContent = Number(control.get()).toFixed(2);
      el.addEventListener("input", () => {
        const v = Number(el.value);
        control.set(v);
        out.textContent = v.toFixed(2);
      });
      control.el = el;
      control.out = out;
    }

    document.getElementById("randomizeBtn").addEventListener("click", () => {
      this.scheduler.paper_grain = rand(...RANDOMIZE_BOUNDS.paperGrain);
      this.scheduler.background_tone = rand(...RANDOMIZE_BOUNDS.backgroundTone);
      this.scheduler.global_opacity = rand(...RANDOMIZE_BOUNDS.opacity);
      this.scheduler.thermal_boost = rand(...RANDOMIZE_BOUNDS.thermalBoost);
      this.scheduler.exposure = rand(...RANDOMIZE_BOUNDS.exposure);
      this.scheduler.bloom_strength = rand(...RANDOMIZE_BOUNDS.bloomStrength);
      this.scheduler.blur_strength = rand(...RANDOMIZE_BOUNDS.blurStrength);
      this.scheduler.overlap_emphasis = rand(...RANDOMIZE_BOUNDS.overlapEmphasis);
      this.scheduler.contrast = rand(...RANDOMIZE_BOUNDS.contrast);
      this.scheduler.paper_white = rand(...RANDOMIZE_BOUNDS.paperWhite);
      this._syncUIValues();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      this.scheduler.resetScene();
    });

    document.getElementById("bleachBtn").addEventListener("click", () => {
      this.scheduler.bleach();
    });

    this.pauseBtn = document.getElementById("pauseBtn");
    this.captureBtn = document.getElementById("captureBtn");
    this.fullscreenBtn = document.getElementById("fullscreenBtn");
    this.pauseBtn.addEventListener("click", () => this._togglePause());
    this.captureBtn.addEventListener("click", () => this._captureFrame());
    this.fullscreenBtn.addEventListener("click", () => this._toggleFullscreen());
    this._setPaused(this.isPaused);
    this._setFullscreenUi();

    this.userPresetName = document.getElementById("userPresetName");
    this.savedPresetSelect = document.getElementById("savedPresetSelect");
    this.savedVisualPresets = this._loadSavedPresets();
    const lastSavedName = this._getLastSavedPresetName();
    this.activeSavedPresetName = (lastSavedName && this.savedVisualPresets[lastSavedName]) ? lastSavedName : "";
    this._refreshSavedPresetList();

    this.savedPresetSelect.addEventListener("change", () => {
      this.userPresetName.value = this.savedPresetSelect.value;
    });

    document.getElementById("savePresetBtn").addEventListener("click", () => {
      const rawName = this.userPresetName.value.trim() || this.savedPresetSelect.value.trim();
      if (!rawName) return;
      const name = rawName.slice(0, 32);
      this.savedVisualPresets[name] = this._captureVisualState();
      this._persistSavedPresets();
      this._rememberLastSavedPresetName(name);
      this.activeSavedPresetName = name;
      this._refreshSavedPresetList();
    });

    document.getElementById("loadPresetBtn").addEventListener("click", () => {
      const name = this.savedPresetSelect.value;
      if (!name || !this.savedVisualPresets[name]) return;
      this._applyVisualState(this.savedVisualPresets[name]);
      this.userPresetName.value = name;
      this._rememberLastSavedPresetName(name);
      this.activeSavedPresetName = name;
    });

    document.getElementById("deletePresetBtn").addEventListener("click", () => {
      const name = this.savedPresetSelect.value;
      if (!name || !this.savedVisualPresets[name]) return;
      delete this.savedVisualPresets[name];
      this._persistSavedPresets();
      if (this.activeSavedPresetName === name) {
        this.activeSavedPresetName = "";
      }
      if (this._getLastSavedPresetName() === name) {
        this._rememberLastSavedPresetName("");
      }
      this._refreshSavedPresetList();
    });
  }

  _bindAudioLaneUI() {
    this.audioLaneUi = {
      kick: {
        fill: document.getElementById("laneKickFill"),
        value: document.getElementById("laneKickValue"),
        onset: document.getElementById("laneKickOnset"),
      },
      snare: {
        fill: document.getElementById("laneSnareFill"),
        value: document.getElementById("laneSnareValue"),
        onset: document.getElementById("laneSnareOnset"),
      },
      hat: {
        fill: document.getElementById("laneHatFill"),
        value: document.getElementById("laneHatValue"),
        onset: document.getElementById("laneHatOnset"),
      },
      sustain: {
        fill: document.getElementById("laneSustainFill"),
        value: document.getElementById("laneSustainValue"),
        onset: document.getElementById("laneSustainOnset"),
      },
    };
    this.laneSensitivityUi = {
      kick: {
        input: document.getElementById("laneKickSensitivity"),
        value: document.getElementById("laneKickSensitivityValue"),
      },
      snare: {
        input: document.getElementById("laneSnareSensitivity"),
        value: document.getElementById("laneSnareSensitivityValue"),
      },
      hat: {
        input: document.getElementById("laneHatSensitivity"),
        value: document.getElementById("laneHatSensitivityValue"),
      },
      sustain: {
        input: document.getElementById("laneSustainSensitivity"),
        value: document.getElementById("laneSustainSensitivityValue"),
      },
    };
    for (const [key, ui] of Object.entries(this.laneSensitivityUi)) {
      if (!ui || !ui.input) continue;
      ui.input.addEventListener("input", () => {
        const next = this.audioInput.setLaneSensitivity(key, Number(ui.input.value));
        ui.input.value = String(next);
        if (ui.value) ui.value.textContent = next.toFixed(2);
      });
    }
    this._syncLaneSensitivityUI();
    this._updateAudioLaneUI(EMPTY_AUDIO_LANES, 0);
  }

  _syncLaneSensitivityUI() {
    if (!this.laneSensitivityUi) return;
    for (const [key, ui] of Object.entries(this.laneSensitivityUi)) {
      if (!ui || !ui.input) continue;
      const current = this.audioInput.getLaneSensitivity(key);
      ui.input.value = String(current);
      if (ui.value) ui.value.textContent = current.toFixed(2);
    }
  }

  _updateAudioLaneUI(lanes, dt = 0) {
    if (!this.audioLaneUi) return;
    const src = (lanes && typeof lanes === "object") ? lanes : EMPTY_AUDIO_LANES;
    const holdDuration = { kick: 0.14, snare: 0.12, hat: 0.1, sustain: 0.08 };
    for (const key of Object.keys(this.audioLaneUi)) {
      const ui = this.audioLaneUi[key];
      if (!ui) continue;
      const level = clamp(Number(src[key]) || 0, 0, 1);
      if (ui.fill) ui.fill.style.width = `${(level * 100).toFixed(1)}%`;
      if (ui.value) ui.value.textContent = level.toFixed(2);

      if (this.lanePulseHold[key] > 0) {
        this.lanePulseHold[key] = Math.max(0, this.lanePulseHold[key] - Math.max(0, dt));
      }
      const onsetNow = key === "sustain"
        ? level > 0.58
        : ((Number(src[`${key}Onset`]) || 0) > 0.5);
      if (onsetNow) this.lanePulseHold[key] = holdDuration[key];
      if (ui.onset) ui.onset.classList.toggle("active", this.lanePulseHold[key] > 0);
    }
  }

  _captureVisualState() {
    return {
      presetName: this.scheduler.presetName,
      renderScale: this.renderScale,
      contrast: this.scheduler.contrast,
      paperWhite: this.scheduler.paper_white,
      backgroundTone: this.scheduler.background_tone,
      paperGrain: this.scheduler.paper_grain,
      exposure: this.scheduler.exposure,
      bloomStrength: this.scheduler.bloom_strength,
      blurStrength: this.scheduler.blur_strength,
      overlapEmphasis: this.scheduler.overlap_emphasis,
      thermalBoost: this.scheduler.thermal_boost,
      opacity: this.scheduler.global_opacity,
      effectEnabled: this.scheduler.captureEffectEnabledState(),
      effectAmount: this.scheduler.captureEffectAmountState(),
      effectSpeed: this.scheduler.captureEffectSpeedState(),
    };
  }

  _applyVisualState(state) {
    const normalized = normalizeVisualState(state, this.scheduler.presetName);
    this.scheduler.setPresetByName(normalized.presetName);
    this.renderScale = normalized.renderScale;
    this.scheduler.contrast = normalized.contrast;
    this.scheduler.paper_white = normalized.paperWhite;
    this.scheduler.background_tone = normalized.backgroundTone;
    this.scheduler.paper_grain = normalized.paperGrain;
    this.scheduler.exposure = normalized.exposure;
    this.scheduler.bloom_strength = normalized.bloomStrength;
    this.scheduler.blur_strength = normalized.blurStrength;
    this.scheduler.overlap_emphasis = normalized.overlapEmphasis;
    this.scheduler.thermal_boost = normalized.thermalBoost;
    this.scheduler.global_opacity = normalized.opacity;
    this.scheduler.setEffectEnabledState(normalized.effectEnabled);
    this.scheduler.setEffectAmountState(normalized.effectAmount);
    this.scheduler.setEffectSpeedState(normalized.effectSpeed);
    this._createAccumTarget();
    this._syncUIValues();
  }

  _loadSavedPresets() {
    const storageKeys = [USER_PRESET_STORAGE_KEY, ...USER_PRESET_STORAGE_BACKUP_KEYS];
    let best = null;

    try {
      for (const key of storageKeys) {
        const raw = localStorage.getItem(key);
        const parsed = parsePresetStore(raw);
        if (!parsed) continue;
        const candidate = {
          key,
          presets: parsed.presets,
          updatedAt: parsed.updatedAt,
          count: Object.keys(parsed.presets).length,
        };

        if (!best) {
          best = candidate;
          continue;
        }
        if (candidate.updatedAt > best.updatedAt) {
          best = candidate;
          continue;
        }
        if (candidate.updatedAt === best.updatedAt && candidate.count > best.count) {
          best = candidate;
        }
      }
    } catch {
      return {};
    }

    if (!best) return {};

    // Keep all backup slots in sync with the freshest readable snapshot.
    this._writePresetStoreToAllSlots(best.presets, best.updatedAt || Date.now());
    return best.presets;
  }

  _persistSavedPresets() {
    try {
      this._writePresetStoreToAllSlots(this.savedVisualPresets, Date.now());
    } catch {
      // Ignore quota and storage access errors.
    }
  }

  _getLastSavedPresetName() {
    const keys = [USER_PRESET_LAST_KEY, ...USER_PRESET_LAST_BACKUP_KEYS];
    try {
      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          if (key !== USER_PRESET_LAST_KEY) this._rememberLastSavedPresetName(value);
          return value;
        }
      }
      return "";
    } catch {
      return "";
    }
  }

  _rememberLastSavedPresetName(name) {
    const keys = [USER_PRESET_LAST_KEY, ...USER_PRESET_LAST_BACKUP_KEYS];
    try {
      for (const key of keys) {
        if (name) {
          localStorage.setItem(key, name);
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore storage access errors.
    }
  }

  _writePresetStoreToAllSlots(presets, updatedAt = Date.now()) {
    const raw = serializePresetStore(presets, updatedAt);
    const keys = [USER_PRESET_STORAGE_KEY, ...USER_PRESET_STORAGE_BACKUP_KEYS];
    for (const key of keys) {
      try {
        localStorage.setItem(key, raw);
      } catch {
        // Ignore per-key write errors and continue.
      }
    }
  }

  _refreshSavedPresetList() {
    const names = Object.keys(this.savedVisualPresets).sort((a, b) => a.localeCompare(b));
    this.savedPresetSelect.innerHTML = "";
    if (names.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No saved presets";
      this.savedPresetSelect.appendChild(opt);
      this.savedPresetSelect.disabled = true;
      this.userPresetName.value = "";
      return;
    }

    this.savedPresetSelect.disabled = false;
    for (const name of names) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      this.savedPresetSelect.appendChild(opt);
    }

    const selected = (this.activeSavedPresetName && this.savedVisualPresets[this.activeSavedPresetName]) ? this.activeSavedPresetName : names[0];
    this.savedPresetSelect.value = selected;
    this.userPresetName.value = selected;
  }

  _syncUIValues() {
    this.presetSelect.value = this.scheduler.presetName;
    if (this.inputModeSelect) this.inputModeSelect.value = this.inputMode;
    for (const c of this.controls) {
      const v = c.get();
      c.el.value = String(v);
      c.out.textContent = Number(v).toFixed(2);
    }
    for (const key of EFFECT_TOGGLE_KEYS) {
      const checkbox = this.effectCheckboxes ? this.effectCheckboxes[key] : null;
      if (checkbox) checkbox.checked = this.scheduler.isEffectEnabled(key);
      const amountSlider = this.effectAmountSliders ? this.effectAmountSliders[key] : null;
      const amountOut = this.effectAmountOutputs ? this.effectAmountOutputs[key] : null;
      const speedSlider = this.effectSpeedSliders ? this.effectSpeedSliders[key] : null;
      const speedOut = this.effectSpeedOutputs ? this.effectSpeedOutputs[key] : null;
      if (amountSlider) amountSlider.value = String(this.scheduler.getEffectAmount(key));
      if (amountOut) amountOut.textContent = this.scheduler.getEffectAmount(key).toFixed(2);
      if (speedSlider) speedSlider.value = String(this.scheduler.getEffectSpeed(key));
      if (speedOut) speedOut.textContent = `S:${this.scheduler.getEffectSpeed(key).toFixed(2)}x`;
    }
    this._syncLaneSensitivityUI();
    this._syncFractureModeUI();
    this._updateAudioLaneUI(this.rhythm ? this.rhythm.lanes : EMPTY_AUDIO_LANES, 0);
    this._setPaused(this.isPaused);
    this._setFullscreenUi();
  }

  _handleKey(e) {
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
    const isTypingTarget = tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable);

    if (e.key === "F1") {
      e.preventDefault();
      this.panel.classList.toggle("hidden");
      return;
    }

    if (e.key === "Escape" && document.fullscreenElement) {
      e.preventDefault();
      document.exitFullscreen();
      return;
    }

    if (isTypingTarget) return;

    if (e.code === "Space") {
      e.preventDefault();
      this._togglePause();
      return;
    }

    if (e.key.toLowerCase() === "c") {
      this._captureFrame();
      return;
    }

    if (e.key.toLowerCase() === "f") {
      this._toggleFullscreen();
      return;
    }

    if (e.key.toLowerCase() === "m") {
      const nextMode = this.inputMode === "random" ? "sound" : "random";
      this._setInputMode(nextMode);
      return;
    }

    if (e.key.toLowerCase() === "p") this.scheduler.cyclePreset(1);
    if (e.key.toLowerCase() === "o") this.scheduler.cyclePreset(-1);
    if (e.key.toLowerCase() === "r") this.scheduler.resetScene();
    if (e.key.toLowerCase() === "b") this.scheduler.bleach();

    if (e.key === "1") this.scheduler.preset_index = 0;
    if (e.key === "2") this.scheduler.preset_index = 1;
    if (e.key === "3") this.scheduler.preset_index = 2;
    if (e.key === "4") this.scheduler.preset_index = 3;
    if (e.key === "5") this.scheduler.preset_index = 4;

    this._syncUIValues();
  }

  _setPaused(paused) {
    this.isPaused = !!paused;
    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.isPaused ? "Resume" : "Pause";
    }
  }

  _togglePause() {
    this._setPaused(!this.isPaused);
  }

  _setInputStatus(message) {
    if (this.micStatus) this.micStatus.textContent = message;
  }

  _syncFractureModeUI() {
    const mode = this.scheduler.getReactivityMode();
    const isFracture = mode === REACTIVITY_MODE.FRACTURE_SYNC;
    if (this.audioReactiveModeSelect) this.audioReactiveModeSelect.value = mode;
    if (this.fractureIntensityInput) {
      this.fractureIntensityInput.disabled = !isFracture;
      this.fractureIntensityInput.parentElement?.classList.toggle("is-disabled", !isFracture);
    }
    if (this.fractureFrequencyInput) {
      this.fractureFrequencyInput.disabled = !isFracture;
      this.fractureFrequencyInput.parentElement?.classList.toggle("is-disabled", !isFracture);
    }
    const intensity = this.scheduler.getFractureIntensity();
    const frequency = this.scheduler.getFractureFrequency();
    if (this.fractureIntensityInput) this.fractureIntensityInput.value = String(intensity);
    if (this.fractureIntensityValue) this.fractureIntensityValue.textContent = intensity.toFixed(2);
    if (this.fractureFrequencyInput) this.fractureFrequencyInput.value = String(frequency);
    if (this.fractureFrequencyValue) this.fractureFrequencyValue.textContent = frequency.toFixed(2);
  }

  _syncEffectStateFromUI() {
    if (!this.effectCheckboxes && !this.effectAmountSliders && !this.effectSpeedSliders) return;
    for (const key of EFFECT_TOGGLE_KEYS) {
      const checkbox = this.effectCheckboxes ? this.effectCheckboxes[key] : null;
      if (checkbox) this.scheduler.setEffectEnabled(key, !!checkbox.checked);
      const amountSlider = this.effectAmountSliders ? this.effectAmountSliders[key] : null;
      if (amountSlider) this.scheduler.setEffectAmount(key, Number(amountSlider.value) || 0);
      const speedSlider = this.effectSpeedSliders ? this.effectSpeedSliders[key] : null;
      if (speedSlider) this.scheduler.setEffectSpeed(key, Number(speedSlider.value) || 1);
    }
  }

  async _setInputMode(mode) {
    const nextMode = mode === "sound" ? "sound" : "random";
    if (nextMode === "sound") {
      this._setInputStatus("Input: Requesting microphone...");
      const ok = await this.audioInput.start();
      if (!ok) {
        this.inputMode = "random";
        if (this.inputModeSelect) this.inputModeSelect.value = "random";
        this._setInputStatus("Input: Random (microphone unavailable)");
        return;
      }
      this.inputMode = "sound";
      if (this.inputModeSelect) this.inputModeSelect.value = "sound";
      this._setInputStatus("Input: Sound (microphone active)");
      return;
    }

    this.inputMode = "random";
    this.audioInput.stop();
    if (this.inputModeSelect) this.inputModeSelect.value = "random";
    this._setInputStatus("Input: Random");
  }

  _setFullscreenUi() {
    if (!this.fullscreenBtn) return;
    this.fullscreenBtn.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
  }

  async _toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore user gesture and browser fullscreen errors.
    } finally {
      this._setFullscreenUi();
    }
  }

  _captureFrame() {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `strata-capture-${stamp}.png`;

    const triggerDownload = (href) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    if (this.canvas.toBlob) {
      this.canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        triggerDownload(url);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
      return;
    }

    triggerDownload(this.canvas.toDataURL("image/png"));
  }

  _loop(nowMs) {
    requestAnimationFrame((t) => this._loop(t));
    // Adaptive FPS: 30fps active, 10fps idle (no plates + no audio).
    const isIdle = this.scheduler.events.length === 0 && this.inputMode !== "sound";
    const targetFps = isIdle ? 10 : 30;
    const frameBudget = 1000 / targetFps;
    if (nowMs - this._lastFrameMs < frameBudget * 0.9) return;
    this._lastFrameMs = nowMs;

    const wallTime = nowMs * 0.001;
    const dt = clamp(wallTime - this.lastTime, 0, 0.05);
    this.lastTime = wallTime;

    if (!this.isPaused) {
      this.simTime += dt;
      const externalRhythm = this.inputMode === "sound"
        ? this.audioInput.getRhythm(dt)
        : null;
      this.rhythm = this.scheduler.update(dt, this.simTime, externalRhythm);
    }

    // Lane UI throttled to ~15Hz, runtime text to ~5Hz.
    if (nowMs - this._lastLaneUiMs > 66) {
      this._updateAudioLaneUI(this.rhythm ? this.rhythm.lanes : EMPTY_AUDIO_LANES, dt);
      this._lastLaneUiMs = nowMs;
    }
    this._render(this.simTime);
    if (nowMs - this._lastRuntimeTextMs > 200) {
      this._updateRuntimeText();
      this._lastRuntimeTextMs = nowMs;
    }
  }

  _render(time) {
    const gl = this.gl;
    const packed = this.scheduler.packUniformArrays();

    gl.bindVertexArray(this.quadVao);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.accumFbo);
    gl.viewport(0, 0, this.accumWidth, this.accumHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.progPlate);
    gl.uniform2f(this.uniformPlate.u_resolution, this.accumWidth, this.accumHeight);
    gl.uniform1f(this.uniformPlate.u_time, time);
    gl.uniform1f(this.uniformPlate.u_depth, this.scheduler.depth);
    gl.uniform1i(this.uniformPlate.u_plate_count, packed.count);
    gl.uniform4fv(this.uniformPlate.u_plate_data0, packed.data0);
    gl.uniform4fv(this.uniformPlate.u_plate_data1, packed.data1);
    gl.uniform4fv(this.uniformPlate.u_plate_data2, packed.data2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.progComp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(this.uniformComp.u_accum_tex, 0);

    gl.uniform2f(this.uniformComp.u_resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniformComp.u_accum_resolution, this.accumWidth, this.accumHeight);
    gl.uniform1f(this.uniformComp.u_time, time);
    gl.uniform1f(this.uniformComp.u_paper_grain, this.scheduler.paper_grain);
    gl.uniform1f(this.uniformComp.u_bg_tone, this.scheduler.background_tone);
    gl.uniform1f(this.uniformComp.u_global_opacity, this.scheduler.global_opacity);
    gl.uniform1f(this.uniformComp.u_depth, this.scheduler.depth);
    const tint = this.scheduler.currentPaperTint(time);
    gl.uniform3f(this.uniformComp.u_paper_tint, tint[0], tint[1], tint[2]);
    gl.uniform1f(this.uniformComp.u_thermal_boost, this.scheduler.thermal_boost);
    gl.uniform1f(this.uniformComp.u_exposure, this.scheduler.exposure);
    gl.uniform1f(this.uniformComp.u_bloom_strength, this.scheduler.bloom_strength);
    gl.uniform1f(this.uniformComp.u_blur_strength, this.scheduler.blur_strength);
    gl.uniform1f(this.uniformComp.u_contrast, this.scheduler.contrast);
    gl.uniform1f(this.uniformComp.u_overlap_emphasis, this.scheduler.overlap_emphasis);
    gl.uniform1f(this.uniformComp.u_paper_white, this.scheduler.paper_white);
    const fracture = (this.rhythm && this.rhythm.fracture && typeof this.rhythm.fracture === "object")
      ? this.rhythm.fracture
      : null;
    const rect = (fracture && fracture.rect && typeof fracture.rect === "object")
      ? fracture.rect
      : { cx: 0.5, cy: 0.5, w: 0.2, h: 0.2, feather: 0.08 };
    gl.uniform4f(
      this.uniformComp.u_fracture_rect,
      clamp(Number(rect.cx) || 0.5, 0, 1),
      clamp(Number(rect.cy) || 0.5, 0, 1),
      clamp(Number(rect.w) || 0.2, 0.02, 0.9),
      clamp(Number(rect.h) || 0.2, 0.02, 0.9),
    );
    gl.uniform4f(
      this.uniformComp.u_fracture_fx,
      clamp(Number(fracture?.invert) || 0, 0, 1),
      clamp(Number(fracture?.glitch) || 0, 0, 1),
      clamp(Number(fracture?.rotation) || 0, -2.4, 2.4),
      clamp(Number(fracture?.active) || 0, 0, 1),
    );
    gl.uniform2f(
      this.uniformComp.u_fracture_meta,
      clamp(Number(fracture?.seed) || 0, 0, 10000),
      clamp(Number(rect.feather) || 0.08, 0.01, 0.22),
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindVertexArray(null);
  }

  _updateRuntimeText() {
    const lanes = (this.rhythm && this.rhythm.lanes) ? this.rhythm.lanes : EMPTY_AUDIO_LANES;
    const mode = this.scheduler.getReactivityMode();
    const fracture = (this.rhythm && this.rhythm.fracture) ? this.rhythm.fracture : null;
    this.runtimeText.textContent = [
      `State: ${this.isPaused ? "PAUSED" : "RUNNING"}`,
      `Input: ${this.inputMode === "sound" ? "SOUND" : "RANDOM"}`,
      `Reactive: ${mode === REACTIVITY_MODE.FRACTURE_SYNC ? "FRACTURE SYNC" : "CLASSIC"}`,
      `Plates: ${this.scheduler.events.length}`,
      `Depth: ${this.scheduler.depth.toFixed(3)}`,
      `Palette: ${this.scheduler.currentPaletteName(this.simTime)}`,
      `Rhythm L/M/H/Ma: ${this.rhythm.low.toFixed(2)}/${this.rhythm.mid.toFixed(2)}/${this.rhythm.high.toFixed(2)}/${this.rhythm.macro.toFixed(2)}`,
      `Lanes K/S/H/Su/T: ${lanes.kick.toFixed(2)}/${lanes.snare.toFixed(2)}/${lanes.hat.toFixed(2)}/${lanes.sustain.toFixed(2)}/${(lanes.transient || 0).toFixed(2)}`,
      `Fracture Int/Freq: ${this.scheduler.getFractureIntensity().toFixed(2)}/${this.scheduler.getFractureFrequency().toFixed(2)}`,
      `Fracture Pulse/Combo: ${(fracture?.pulse || 0).toFixed(2)}/${(fracture?.combo || 0).toFixed(2)}`,
      "Toggle panel: F1",
      "Shortcut: Space pause, C capture, F fullscreen, Esc windowed, M input mode, P/O preset, 1-5 slot, R reset, B bleach",
    ].join("\n");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  try {
    new StrataWebApp();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<pre style="padding:16px;color:#fff;background:#111;">Web app init failed:\n${String(err)}</pre>`;
  }
});
