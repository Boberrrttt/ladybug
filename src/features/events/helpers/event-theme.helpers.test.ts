import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_EVENT_THEME,
  EventThemePreset,
  darkenHex,
  isHexColor,
  normalizeEventTheme,
  normalizeHexColor,
  findEventThemePresetByColors,
  onColorForBackground,
  EventFontStyle,
  parseThemeFromForm,
  resolveEventBrandSurfaceStyle,
  resolveEventFontStack,
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
  assert.equal(style.backgroundSize, "contain");
  assert.doesNotMatch(style.backgroundImage ?? "", /linear-gradient/);
  assert.match(style.backgroundImage ?? "", /ik\.imagekit\.io\/demo\/bg\.jpg/);
  assert.equal(style["--album-title"], "#000000");
});

test("findEventThemePresetByColors matches a preset from the color picker", () => {
  assert.equal(findEventThemePresetByColors("#F7F3EB", "#8A5A2B")?.label, "Sand");
  assert.equal(findEventThemePresetByColors("#111111", "#222222"), undefined);
});

test("normalizeEventTheme drops default and unknown font styles", () => {
  assert.deepEqual(normalizeEventTheme({ presetId: EventThemePreset.CLASSIC, fontStyle: "SANS" }), {
    presetId: EventThemePreset.CLASSIC,
  });
  assert.deepEqual(normalizeEventTheme({ presetId: EventThemePreset.CLASSIC, fontStyle: "COMIC" }), {
    presetId: EventThemePreset.CLASSIC,
  });
});

test("normalizeEventTheme keeps a non-default font style", () => {
  assert.deepEqual(
    normalizeEventTheme({ presetId: EventThemePreset.BLUSH, fontStyle: EventFontStyle.SCRIPT }),
    { presetId: EventThemePreset.BLUSH, fontStyle: EventFontStyle.SCRIPT },
  );
});

test("parseThemeFromForm reads font style and drops sans", () => {
  const serif = new FormData();
  serif.set("presetId", EventThemePreset.CLASSIC);
  serif.set("fontStyle", EventFontStyle.SERIF);
  assert.deepEqual(parseThemeFromForm(serif), {
    presetId: EventThemePreset.CLASSIC,
    fontStyle: EventFontStyle.SERIF,
  });

  const sans = new FormData();
  sans.set("presetId", EventThemePreset.CLASSIC);
  sans.set("fontStyle", EventFontStyle.SANS);
  assert.deepEqual(parseThemeFromForm(sans), { presetId: EventThemePreset.CLASSIC });

  const unknown = new FormData();
  unknown.set("presetId", EventThemePreset.CLASSIC);
  unknown.set("fontStyle", "NOPE");
  assert.deepEqual(parseThemeFromForm(unknown), { presetId: EventThemePreset.CLASSIC });
});

test("resolveEventThemeCssVars sets album font stack", () => {
  const serif = resolveEventThemeCssVars({
    presetId: EventThemePreset.CLASSIC,
    fontStyle: EventFontStyle.SERIF,
  });
  assert.equal(serif["--font-album"], resolveEventFontStack({
    presetId: EventThemePreset.CLASSIC,
    fontStyle: EventFontStyle.SERIF,
  }));
  assert.equal(serif["--font-album"], "var(--font-newsreader), Georgia, serif");
  assert.equal(
    resolveEventFontStack({ presetId: EventThemePreset.CLASSIC, fontStyle: EventFontStyle.BRUSH }),
    "var(--font-brush), cursive",
  );

  const sans = resolveEventThemeCssVars(DEFAULT_EVENT_THEME);
  assert.equal(sans["--font-album"], "var(--font-manrope), system-ui, sans-serif");
});

test("resolveEventBrandSurfaceStyle contrasts title with page color", () => {
  const dark = resolveEventBrandSurfaceStyle({
    presetId: EventThemePreset.SAND,
    page: "#1a1208",
  });
  assert.equal(dark["--album-title"], "#ffffff");

  const light = resolveEventBrandSurfaceStyle(DEFAULT_EVENT_THEME);
  assert.equal(light["--album-title"], "#111111");
});
