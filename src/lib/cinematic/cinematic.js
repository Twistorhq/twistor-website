/* Twistor Cinematic Kit engine. Prepared by Twistor Holdings LLC.
 * Framework-free, no dependencies, no CDN. Implements the TW-1024/1025
 * standard: poster-first load, binary-subdivision preload, decode-ahead
 * ImageBitmap ring buffer, fail-closed tier probe, one scroll playhead,
 * reversible state machine over the CS-S1 segment grammar.
 * GSAP is pattern-study only at Twistor and is never shipped here.
 */
"use strict";

/* ---------- Tier probe (fails closed to D) ----------
 * Inputs are REA 3.5's: WebGL2 renderer string, deviceMemory,
 * hardwareConcurrency, DPR, Save-Data, effective connection type,
 * plus a live micro-benchmark: the sample frame is decoded
 * DECODE_SAMPLES times and each decode is timed. The tier statistic
 * is the MEDIAN per-decode time. With three samples a median is the
 * honest statistic; a p95 needs a long measured run like the Our
 * LGCY render probe's 120 frames (TW-1012), which belongs to a
 * WebGL render loop, not a decode benchmark.
 * The thresholds are the house tier bands, shared with the LGCY
 * tiering probe (TW-1012, Rosa-approved): <= 22 ms is Tier A pace,
 * <= 34 ms is Tier B pace. They sit against REA 3.2's decode range
 * (WebP ~8-20 ms on a mid mobile CPU, AVIF 2-3x that, against a
 * 16.7 ms frame budget): the A band is one frame budget plus the
 * 1-3 ms draw blit and jitter headroom, the B band is roughly two
 * frame budgets. A device whose median decode beats neither band
 * gets Tier C: the ambient cut is played, not scrubbed, and no
 * decode-ahead ring can save a scrub the decoder cannot feed. */
const DECODE_SAMPLES = 3;
const DECODE_A_MAX_MS = 22; // house band, LGCY tiering (TW-1012)
const DECODE_B_MAX_MS = 34; // house band, LGCY tiering (TW-1012)

export async function probeTier(sampleFrameUrl) {
  try {
    const nav = navigator;
    if (nav.connection && nav.connection.saveData) return "C";
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return "D";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "") : "";
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "C";
    const mem = nav.deviceMemory || 4;
    const cores = nav.hardwareConcurrency || 4;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const blob = await (await fetch(sampleFrameUrl)).blob();
    const samples = [];
    for (let s = 0; s < DECODE_SAMPLES; s++) {
      const t0 = performance.now();
      const bmp = await createImageBitmap(blob);
      samples.push(performance.now() - t0);
      bmp.close();
    }
    samples.sort((a, b) => a - b);
    const decodeMs = samples[Math.floor(samples.length / 2)]; // median of 3
    const fast = !(nav.connection && ["slow-2g", "2g", "3g"].includes(nav.connection.effectiveType));
    if (mem >= 4 && cores >= 4 && dpr >= 1.5 && fast && decodeMs <= DECODE_A_MAX_MS) return "A";
    if (mem >= 2 && cores >= 2 && decodeMs <= DECODE_B_MAX_MS) return "B";
    return "C";
  } catch (err) {
    return "D"; // fail closed: the floor is a first-class experience
  }
}

/* ---------- Binary-subdivision priority order ----------
 * For N frames: every 8th, then every 4th, 2nd, then the gaps, so a
 * coarse but complete scrub exists almost immediately (Apple's
 * discipline, REA 3.1). Returns frame indices in load order. */
export function subdivisionOrder(count) {
  const seen = new Set();
  const order = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

/* ---------- Sequence loader with decode-ahead ring buffer ---------- */
export class Sequence {
  constructor({ frameUrl, count, ringSize }) {
    this.frameUrl = frameUrl; // (index) => url
    this.count = count;
    // ONE ring definition, used by trim() and draw() alike: ringSize
    // is the TOTAL number of frames the ring holds (REA 3.2: Tier A
    // 17, Tier B 9, C/D 0), centered on the playhead, so the window
    // each side is halfRing = floor(ringSize / 2): A keeps +/-8
    // around the playhead (17 frames), B keeps +/-4 (9 frames).
    this.ringSize = ringSize;
    this.halfRing = Math.floor(ringSize / 2);
    this.playhead = -1; // last drawn frame; the ring centers on it
    this.lastLoaded = -1; // ring center before the first draw
    this.bitmaps = new Map();
    this.loading = new Set();
  }

  async loadFrame(i) {
    if (this.bitmaps.has(i) || this.loading.has(i) || i < 0 || i >= this.count) return;
    this.loading.add(i);
    try {
      const blob = await (await fetch(this.frameUrl(i))).blob();
      const bmp = await createImageBitmap(blob);
      this.bitmaps.set(i, bmp);
      this.lastLoaded = i;
      this.trim();
    } catch (err) {
      /* a missing frame holds the previous one; never a blank canvas */
    } finally {
      this.loading.delete(i);
    }
  }

  async preload() {
    for (const i of subdivisionOrder(this.count)) {
      // Priority frames stream without blocking the first scrub.
      if (i % 8 === 0) await this.loadFrame(i);
      else this.loadFrame(i);
    }
  }

  trim() {
    if (this.ringSize === 0) return; // C/D hold no ring (REA 3.2)
    const center = this.playhead >= 0 ? this.playhead : this.lastLoaded;
    if (center < 0) return;
    for (const [i, bmp] of this.bitmaps) {
      if (Math.abs(i - center) > this.halfRing) {
        bmp.close();
        this.bitmaps.delete(i);
      }
    }
  }

  draw(ctx, progress) {
    const idx = Math.min(this.count - 1, Math.max(0, Math.round(progress * (this.count - 1))));
    let bmp = this.bitmaps.get(idx);
    if (!bmp) {
      // Nearest decoded frame either side; scrub never shows blank.
      for (let d = 1; d < this.count; d++) {
        bmp = this.bitmaps.get(idx - d) || this.bitmaps.get(idx + d);
        if (bmp) break;
      }
    }
    if (bmp) ctx.drawImage(bmp, 0, 0, ctx.canvas.width, ctx.canvas.height);
    this.playhead = idx; // the ring centers on the playhead (trim)
    for (let d = 1; d <= this.halfRing; d++) {
      this.loadFrame(idx + d);
      this.loadFrame(idx - d);
    }
    return idx;
  }
}

/* ---------- Guide-object journey (TW-1048, teardown section 2) ----------
 * One persistent guide object rides the whole flight. Its per-segment
 * state is scene data (CS-S3): FLOAT in ESTABLISH, PATH_TIP on the
 * path-drawing TRAVEL, PARK at a dwell prop, DRIFT beside it, FLOAT
 * again on RETURN. The table below is the FORWARD (scroll-down)
 * choreography law: the guide leaves the hero only onto the path, a
 * dwell is reached from the path or from another dwell state, and the
 * return exits a DRIFT or a PARK back to FLOAT. Reverse playback
 * (scroll-up) walks the same edges backward; isGuideTransition with
 * direction "reverse" answers for that traversal. A same-mode pair is
 * never a transition. */
export const GUIDE_TRANSITIONS = {
  FLOAT: ["PATH_TIP"],
  PATH_TIP: ["PARK", "DRIFT"],
  PARK: ["DRIFT", "PATH_TIP", "FLOAT"],
  DRIFT: ["FLOAT"],
};

export function isGuideTransition(from, to, direction = "forward") {
  if (from === to) return false;
  return direction === "reverse"
    ? (GUIDE_TRANSITIONS[to] || []).includes(from)
    : (GUIDE_TRANSITIONS[from] || []).includes(to);
}

export function guideTimeline(scene) {
  return scene.segments
    .filter((s) => s.guide)
    .map((s) => ({ seg: s.id, mode: s.guide.mode }));
}

/* ---------- State machine (CS-S1 grammar) ----------
 * One normalized progress value drives canvas and every overlay.
 * Forward and reverse are the same function: progress is the state. */
export class Flight {
  constructor(scene, canvas, overlayRoot) {
    this.scene = scene;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.root = overlayRoot;
    this.totalFrames = scene.segments.reduce((n, s) => n + s.frames, 0);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  segmentAt(globalFrame) {
    let acc = 0;
    for (const seg of this.scene.segments) {
      if (globalFrame < acc + seg.frames) return { seg, local: globalFrame - acc };
      acc += seg.frames;
    }
    const last = this.scene.segments[this.scene.segments.length - 1];
    return { seg: last, local: last.frames - 1 };
  }

  render(progress) {
    if (this.reduced) return; // CS-A1: posters over structured view instead
    const frame = progress * (this.totalFrames - 1);
    const { seg, local } = this.segmentAt(frame);
    const seq = this.sequences && this.sequences[seg.id];
    if (seq) seq.draw(this.ctx, seg.frames > 1 ? local / (seg.frames - 1) : 0);
    const g = seg.guide;
    if (g) {
      // The guide object itself is in-film; the DOM only mirrors its
      // state for overlays, CSS, and assistive parity (CS-S4).
      this.root.dataset.guideMode = g.mode;
      this.root.dataset.guideScale = String(g.scale);
      this.root.dataset.guideParallax = String(g.parallax);
      if (g.anchorProp) this.root.dataset.guideAnchor = g.anchorProp;
      else delete this.root.dataset.guideAnchor;
    }
    this.updateOverlays(seg, local);
    return seg.id;
  }

  updateOverlays(seg, local) {
    // Overlays are DOM keyed to segment + frame range (CS-S2/S3).
    // Interactive elements exist only in DWELL / EXPLORE states (CS-S5).
    const interactive = seg.type === "DWELL" || seg.type === "EXPLORE";
    for (const el of this.root.querySelectorAll("[data-overlay]")) {
      const on = el.dataset.state === seg.id || el.dataset.state === "ALL";
      el.hidden = !on;
      if (el.dataset.interactive === "true") {
        el.style.pointerEvents = on && interactive ? "auto" : "none";
        el.tabIndex = on && interactive ? 0 : -1;
      }
    }
    // KineticHeadline (CS-S2 amendment, TW-1048): lines are DOM keyed
    // to frame ranges inside their segment (teardown section 3). Each
    // line carries its own data-state and data-reveal-frame; the CSS
    // mask-rise plays when data-revealed flips true. Accent-last is a
    // scene-data rule, enforced by the validator, not here.
    for (const el of this.root.querySelectorAll("[data-line]")) {
      const on =
        el.dataset.state === seg.id &&
        local >= Number(el.dataset.revealFrame || 0);
      el.hidden = !on;
      el.dataset.revealed = on ? "true" : "false";
    }
    this.root.dataset.state = seg.id;
    this.root.dataset.frame = String(Math.round(local));
  }
}

/* ---------- Scroll driver: lerp low-pass over native scroll ----------
 * Raw wheel deltas arrive in notches; a lerp (~0.1) spreads each notch
 * over rendered ticks so the playhead moves continuously (REA 3.2). */
export function driveScroll(flight, trackEl) {
  let target = 0;
  let current = 0;
  let rafId = 0;
  let stopped = false;
  const onScroll = () => {
    const rect = trackEl.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    target = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const tick = () => {
    if (stopped) return; // a tick already queued at teardown never reschedules
    current += (target - current) * 0.1;
    if (Math.abs(target - current) > 0.0001) flight.render(current);
    rafId = requestAnimationFrame(tick);
  };
  onScroll();
  flight.render(0);
  rafId = requestAnimationFrame(tick);
  // Teardown symmetry: everything setup registers, cleanup releases
  // (scroll listener AND the rAF loop), the TW-1012 slice-1 rule.
  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", onScroll);
  };
}
