import { probeTier, Sequence, Flight, driveScroll } from "../lib/cinematic/cinematic.js";

const scene = await (await fetch("cinematic/scene.json")).json();
const override = new URLSearchParams(location.search).get("tier");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.dataset.reduced = reduced ? "true" : "false";
let tier = override ? override.toUpperCase() : await probeTier("cinematic/media/a/establish/0000.avif");
document.documentElement.dataset.tier = tier;
const toggle = document.getElementById("view-toggle");
toggle.addEventListener("click", () => {
  tier = tier === "D" ? "A" : "D";
  document.documentElement.dataset.tier = tier;
  location.search = "?tier=" + tier;
});
const posterImg = document.querySelector(".poster-first");
const wireControls = (flight) => {
  for (const nav of document.querySelectorAll("[data-overlay='PillNav'] button, [data-overlay='BackControl']")) {
    nav.addEventListener("click", () => {
      const target = nav.dataset.target;
      let acc = 0, total = flight.totalFrames;
      for (const seg of scene.segments) {
        if (seg.id === target) { acc += seg.frames / 2; break; }
        acc += seg.frames;
      }
      const track = document.getElementById("flight-track");
      const span = track.offsetHeight - window.innerHeight;
      window.scrollTo(0, track.offsetTop + span * (acc / total) + 2);
    });
  }
  for (const hs of document.querySelectorAll(".hotspot")) {
    hs.addEventListener("click", () => {
      document.getElementById("fact-" + hs.dataset.fact).scrollIntoView();
    });
  }
};
if (tier === "C" && !reduced) {
  /* Tier C: the ambient cut plays; the Flight still runs so the
     overlay choreography and field flips follow the scroll. */
  document.getElementById("ambient").play().catch(() => {});
  const flight = new Flight(scene, document.getElementById("flight-canvas"),
                            document.querySelector(".flight-sticky"));
  flight.sequences = {};
  window.__flight = flight;
  driveScroll(flight, document.getElementById("flight-track"));
  wireControls(flight);
  if (posterImg) posterImg.remove();
} else if (tier !== "D" && !reduced) {
  const flight = new Flight(scene, document.getElementById("flight-canvas"),
                            document.querySelector(".flight-sticky"));
  flight.sequences = {};
  let estReady = null;
  for (const seg of scene.segments) {
    const spec = scene.tiers[tier];
    const seq = new Sequence({
      frameUrl: (i) => {
        const idx = i;
        const ext = tier === "A" ? "avif" : "webp";
        return `cinematic/media/${tier.toLowerCase()}/${seg.id}/${String(idx).padStart(4, "0")}.${ext}`;
      },
      count: seg.frames,
      ringSize: spec.ring,
    });
    const ready = seq.preload();
    if (seg.id === "establish") estReady = ready;
    flight.sequences[seg.id] = seq;
  }
  window.__flight = flight;
  driveScroll(flight, document.getElementById("flight-track"));
  wireControls(flight);
  if (posterImg && estReady) {
    /* The poster is the first paint (CS-B1/B2). The scroll driver
       only re-renders while the playhead is converging, so a page
       at rest would hold the blank canvas after the priority frames
       land; re-render once at the live progress, then lift the
       poster. If frames never arrive the poster stays: the floor. */
    estReady.then(() => {
      const track = document.getElementById("flight-track");
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      flight.render(p);
      posterImg.remove();
    });
  }
} else if (posterImg) {
  posterImg.remove();
}
