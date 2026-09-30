import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_EVENT_THEME,
  EventThemePreset,
  darkenHex,
  isHexColor,
  normalizeEventTheme,
  normalizeHexColor,
  onColorForBackground,
  parseThemeFromForm,
  resolveEventBrandSurfaceStyle,
  resolveEventThemeCssVars,
  resolveEventThemeTokens,
} from "./event-theme.helpers.ts";

test("isHexColor accepts only #RRGGBB", () => {
  assert.equal(isHexColor("#e60023"), true);
  assert.equal(isHexColor("#E60023"), true);
  assert.equal(isHexColor("#fff"), false);
  assert.equal(isHexColor("e60023"), false);
  assert.equal(isHexColor(null), false);
});

test("normalizeHexColor lowercases valid hex", () => {
  assert.equal(normalizeHexColor("#E60023"), "#e60023");
  assert.throws(() => normalizeHexColor("red"));
});

test("normalizeEventTheme defaults missing docs to classic", () => {
  assert.deepEqual(normalizeEventTheme(undefined), DEFAULT_EVENT_THEME);
  assert.deepEqual(normalizeEventTheme({}), { presetId: EventThemePreset.CLASSIC });
});

test("normalizeEventTheme keeps valid overrides", () => {
  assert.deepEqual(
    normalizeEventTheme({
      presetId: EventThemePreset.FOREST,
      page: "#ABCDEF",
      primary: "#123456",
    }),
    {
      presetId: EventThemePreset.FOREST,
      page: "#abcdef",
      primary: "#123456",
    },
  );
});

test("resolveEventThemeTokens derives pressed and on-primary", () => {
  const classic = resolveEventThemeTokens(DEFAULT_EVENT_THEME);
  assert.equal(classic.page, "#fbfbf9");
  assert.equal(classic.primary, "#e60023");
  assert.equal(classic.primaryPressed, darkenHex("#e60023", 0.1));
  assert.equal(classic.onPrimary, "#ffffff");

  const lightAccent = resolveEventThemeTokens({
    presetId: EventThemePreset.CLASSIC,
    primary: "#f5f5f0",
  });
  assert.equal(lightAccent.onPrimary, onColorForBackground("#f5f5f0"));
  assert.equal(lightAccent.onPrimary, "#111111");
});

test("resolveEventThemeCssVars sets token map", () => {
  const cssVars = resolveEventThemeCssVars({
    presetId: EventThemePreset.COBALT,
    page: "#f0f4fa",
  });
  assert.equal(cssVars["--color-page"], "#f0f4fa");
  assert.equal(cssVars["--color-primary"], "#2a5f9e");
  assert.ok(cssVars["--color-primary-pressed"]);
  assert.ok(cssVars["--color-on-primary"]);
});

test("parseThemeFromForm drops overrides that match preset", () => {
  const formData = new FormData();
  formData.set("presetId", EventThemePreset.CLASSIC);
  formData.set("page", "#fbfbf9");
  formData.set("primary", "#e60023");
  assert.deepEqual(parseThemeFromForm(formData), { presetId: EventThemePreset.CLASSIC });
});

test("parseThemeFromForm keeps custom overrides", () => {
  const formData = new FormData();
  formData.set("presetId", EventThemePreset.BLUSH);
  formData.set("page", "#ffeeee");
  formData.set("primary", "#aa3344");
  assert.deepEqual(parseThemeFromForm(formData), {
    presetId: EventThemePreset.BLUSH,
    page: "#ffeeee",
    primary: "#aa3344",
  });
});

test("normalizeEventTheme keeps backgroundUrl", () => {
  assert.deepEqual(
    normalizeEventTheme({
      presetId: EventThemePreset.INK,
      backgroundUrl: "https://ik.imagekit.io/demo/bg.jpg",
    }),
    {
      presetId: EventThemePreset.INK,
      backgroundUrl: "https://ik.imagekit.io/demo/bg.jpg",
    },
  );
});

test("resolveEventBrandSurfaceStyle uses bare background image", () => {
  const style = resolveEventBrandSurfaceStyle({
    presetId: EventThemePreset.CLASSIC,
    backgroundUrl: "https://ik.imagekit.io/demo/bg.jpg",
  });
  assert.equal(style.backgroundSize, "cover");
  assert.doesNotMatch(style.backgroundImage ?? "", /linear-gradient/);
  assert.match(style.backgroundImage ?? "", /ik\.imagekit\.io\/demo\/bg\.jpg/);
});
