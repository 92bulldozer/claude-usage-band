// Copyright 2026 Anthropic PBC
// SPDX-License-Identifier: Apache-2.0
//
// Token Weather, cut down from anthropics/claude-code-playground to one row
// above the prompt: gauges for the context fill and the plan's usage limits.
//
// session.start: take a first reading, so the row shows before any turn.
// session.measure: take a new reading whenever a figure moves.
// ui.render (AbovePrompt): draw the row, as Svg bars where the surface has
// them and as text where it does not.
//
// The host reads on(...) and $.noun.method(...) from source, so they are
// spelled literally.

const LIMIT_LABELS = { five_hour: "세션", seven_day: "주간", spend_limit: "한도" };
const BAR_W = 44;
const BAR_H = 8;
const TRACK = "#8080804d";
const HIT = "#ffffff";
const FLASH_STEPS = 8;
const FLASH_STEP_MS = 100;
const GAUGE_COLORS = { 컨텍스트: "#fb7185", 세션: "#facc15", 주간: "#34d399" };
const OTHER_COLOR = "#9ca3af";
const STATUS_MS = 3_000;
const ACTIVE_STATUS = ["pending", "running", "waiting"];

// Gauges: { label, percent }, in the order shown.
let gauges = [];
let agentText = "에이전트 0";
// The fade steps each hit gauge has left, by label.
const flashes = new Map();
let isFading = false;
// The model of each agent by id: $.agent.list() does not name it.
const agentModels = new Map();

export function register(on) {
  on("session.start", async ($, e, next) => {
    const result = await next(e);
    const { context, rateLimits } = await $.session.usage();
    gauges = gaugesOf(context, rateLimits);
    await readStatus($);
    $.clock.every(STATUS_MS, () => readStatus($));
    $.ui.invalidate("ui.render");
    return result;
  });

  on("agent.spawn", async ($, e, next) => {
    const result = await next(e);
    if (result.agentId) {
      agentModels.set(result.agentId, modelLabel(result.model));
      await readStatus($);
    }
    return result;
  });

  on("session.measure", async ($, e, next) => {
    const fresh = gaugesOf(e.context, e.rateLimits);
    for (const gauge of fresh) {
      const old = gauges.find((prev) => prev.label === gauge.label);
      if (old && old.percent !== gauge.percent) hit(gauge.label);
    }
    gauges = fresh;
    $.ui.invalidate("ui.render");
    fadeFlashes($);
    return next(e);
  });

  on("ui.render", { component: "AbovePrompt" }, ($, e, next) => {
    if (e.props.hasSurvey || gauges.length === 0) {
      return next(e);
    }
    const { Box, Text, Svg } = $.ui.resolve(e);
    return h(
      Box,
      { flexDirection: "row", alignItems: "center", columnGap: 2, paddingX: 1 },
      ...gauges.map((gauge) => gaugeRow(Box, Text, Svg, gauge)),
      h(Text, { dimColor: true, size: "caption" }, agentText),
    );
  });
}

// An agent's end raises nothing the band hears, so the list is read on a timer.
async function readStatus($) {
  const agents = await $.agent.list();
  const active = agents.filter((agent) => ACTIVE_STATUS.includes(agent.status));
  const text = agentTextOf(active);
  if (text === agentText) return;
  agentText = text;
  $.ui.invalidate("ui.render");
}

function agentTextOf(active) {
  const counts = new Map();
  for (const agent of active) {
    const model = agentModels.get(agent.id) ?? "기타";
    counts.set(model, (counts.get(model) ?? 0) + 1);
  }
  const models = [...counts].map(([model, count]) => `${model} ${count}`);
  return [`에이전트 ${active.length}`, ...models].join(" · ");
}

// claude-haiku-5-5 and haiku read Haiku.
function modelLabel(model) {
  const family = /^(?:claude-)?([a-z]+)/.exec(model)?.[1] ?? model;
  return `${family[0].toUpperCase()}${family.slice(1)}`;
}

function gaugesOf(context, rateLimits) {
  const list = context?.percent === undefined ? [] : [{ label: "컨텍스트", percent: context.percent }];
  for (const limit of rateLimits ?? []) {
    const label = LIMIT_LABELS[limit.kind];
    if (label) list.push({ label, percent: Math.round(limit.percentUsed) });
  }
  return list;
}

function hit(label) {
  flashes.set(label, FLASH_STEPS);
}

// One timer walks every flash down a step a redraw, at the band's redraw limit.
// The bar stays an image: an interactive Svg reloads its frame on each new source.
function fadeFlashes($) {
  if (isFading || flashes.size === 0) return;
  isFading = true;
  $.clock.after(FLASH_STEP_MS, () => {
    isFading = false;
    for (const [label, step] of flashes) {
      if (step === 1) flashes.delete(label);
      else flashes.set(label, step - 1);
    }
    $.ui.invalidate("ui.render");
    fadeFlashes($);
  });
}

function gaugeRow(Box, Text, Svg, { label, percent }) {
  const color = GAUGE_COLORS[label] ?? OTHER_COLOR;
  return h(
    Box,
    { key: label, flexDirection: "row", alignItems: "center", columnGap: 1 },
    h(Text, { dimColor: true, size: "caption" }, label),
    Svg
      ? h(Svg, { source: barSvg(percent, color, flashOf(label)), alt: `${label} ${percent}%`, width: BAR_W, height: BAR_H })
      : h(Text, { color }, textBar(percent)),
    h(Text, { color: towardWhite(color, flashOf(label)), weight: "semibold", size: "caption", tabular: true }, `${percent}%`),
  );
}

// Squared, so white leaves fast and tails off.
function flashOf(label) {
  const left = (flashes.get(label) ?? 0) / FLASH_STEPS;
  return 0.95 * left * left;
}

// A Text takes no opacity, so its fade is a colour between the two.
function towardWhite(color, amount) {
  const channels = [1, 3, 5].map((at) => {
    const value = parseInt(color.slice(at, at + 2), 16);
    return Math.round(value + (255 - value) * amount).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function barSvg(percent, color, flash) {
  const radius = BAR_H / 2;
  const filled = Math.min(100, Math.max(0, percent)) / 100 * BAR_W;
  const width = Math.max(filled, BAR_H);
  const fill = filled > 0 ? `<rect width="${width}" height="${BAR_H}" rx="${radius}" fill="${color}"/>` : "";
  const overlay = filled > 0 && flash > 0
    ? `<rect width="${width}" height="${BAR_H}" rx="${radius}" fill="${HIT}" opacity="${flash.toFixed(3)}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BAR_W}" height="${BAR_H}" viewBox="0 0 ${BAR_W} ${BAR_H}"><rect width="${BAR_W}" height="${BAR_H}" rx="${radius}" fill="${TRACK}"/>${fill}${overlay}</svg>`;
}

function textBar(percent) {
  const filled = Math.round(Math.min(100, Math.max(0, percent)) / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}
