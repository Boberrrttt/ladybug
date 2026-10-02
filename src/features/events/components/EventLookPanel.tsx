"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useActionState, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowCounterClockwise,
  CaretDown,
  Image as ImageIcon,
  Palette,
  Sparkle,
} from "@phosphor-icons/react";
import type { EventTheme } from "@/shared/types";
import {
  EVENT_THEME_PRESETS,
  EventThemePreset,
  findEventThemePresetByColors,
  onColorForBackground,
  resolveEventBrandSurfaceStyle,
  resolveEventThemeTokens,
} from "../helpers/event-theme.helpers";
import {
  clearEventBackgroundAction,
  updateEventThemeAction,
  uploadEventBackgroundAction,
} from "../services/events.actions";

export function EventLookPanel({
  eventId,
  theme,
}: {
  eventId: string;
  theme: EventTheme;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [presetId, setPresetId] = useState(theme.presetId);
  const [page, setPage] = useState(() => resolveEventThemeTokens(theme).page);
  const [primary, setPrimary] = useState(() => resolveEventThemeTokens(theme).primary);
  const [backgroundUrl, setBackgroundUrl] = useState(theme.backgroundUrl);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(updateEventThemeAction, null);
  const [backgroundPending, startBackgroundTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPreset = EVENT_THEME_PRESETS.find((preset) => preset.id === presetId);
  const matchedPreset = findEventThemePresetByColors(page, primary);

  const draftTheme = useMemo<EventTheme>(() => {
    const base = resolveEventThemeTokens({ presetId });
    const next: EventTheme = { presetId };
    if (page.toLowerCase() !== base.page) {
      next.page = page;
    }
    if (primary.toLowerCase() !== base.primary) {
      next.primary = primary;
    }
    if (backgroundUrl) {
      next.backgroundUrl = backgroundUrl;
    }
    return next;
  }, [backgroundUrl, page, presetId, primary]);

  const previewStyle = useMemo(() => {
    const surfaceTheme: EventTheme = {
      presetId: draftTheme.presetId,
      page: draftTheme.page,
      primary: draftTheme.primary,
    };
    return resolveEventBrandSurfaceStyle(surfaceTheme) as CSSProperties;
  }, [draftTheme]);

  function applyPickedColor(nextPage: string, nextPrimary: string) {
    const match = findEventThemePresetByColors(nextPage, nextPrimary);
    if (match) {
      setPresetId(match.id);
    }
    setPage(nextPage);
    setPrimary(nextPrimary);
  }

  function selectPreset(nextPresetId: EventThemePreset) {
    const tokens = resolveEventThemeTokens({ presetId: nextPresetId });
    setPresetId(nextPresetId);
    setPage(tokens.page);
    setPrimary(tokens.primary);
  }

  function resetFineTune() {
    const tokens = resolveEventThemeTokens({ presetId });
    setPage(tokens.page);
    setPrimary(tokens.primary);
  }

  function onBackgroundSelected(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";
    if (!file) {
      return;
    }
    setBackgroundError(null);
    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("file", file);
    startBackgroundTransition(async () => {
      try {
        const nextTheme = await uploadEventBackgroundAction(formData);
        setBackgroundUrl(nextTheme.backgroundUrl);
      } catch (caughtError) {
        setBackgroundError(
          caughtError instanceof Error ? caughtError.message : "Could not upload background",
        );
      }
    });
  }

  function removeBackground() {
    setBackgroundError(null);
    startBackgroundTransition(async () => {
      try {
        await clearEventBackgroundAction(eventId);
        setBackgroundUrl(undefined);
      } catch (caughtError) {
        setBackgroundError(
          caughtError instanceof Error ? caughtError.message : "Could not remove background",
        );
      }
    });
  }

  return (
    <section className={`event-look-panel${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="event-look-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="event-look-toggle-leading">
          <span className="event-look-toggle-icon" aria-hidden="true">
            <Palette size={18} weight="bold" />
          </span>
          <span className="event-look-toggle-copy">
            <span className="event-look-title">Look</span>
            <span className="event-look-lede">Guest album colors and background.</span>
          </span>
        </span>
        <span className="event-look-toggle-trailing">
          {selectedPreset ? (
            <span
              className="event-look-swatch event-look-swatch-sm"
              style={{
                background: `linear-gradient(135deg, ${page} 50%, ${primary} 50%)`,
              }}
              aria-hidden="true"
            />
          ) : null}
          <span className="event-look-toggle-meta">
            {matchedPreset?.label ?? "Custom"}
            {backgroundUrl ? " · Image" : ""}
          </span>
          <CaretDown
            className="event-look-caret"
            size={18}
            weight="bold"
            aria-hidden="true"
          />
        </span>
      </button>

      <div
        id={panelId}
        className="event-look-body"
        hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="event-look-grid">
          <div className="event-look-section">
            <p className="event-look-section-label">
              <Palette size={14} weight="bold" aria-hidden="true" />
              Palette
            </p>
            <div className="event-look-presets" role="listbox" aria-label="Theme presets">
              {EVENT_THEME_PRESETS.map((preset) => {
                const selected = preset.id === presetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectPreset(preset.id)}
                    className={`event-look-preset${selected ? " is-selected" : ""}`}
                  >
                    <span
                      className="event-look-swatch"
                      style={{
                        background: `linear-gradient(135deg, ${preset.tokens.page} 50%, ${preset.tokens.primary} 50%)`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="event-look-preset-label">{preset.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="event-look-colors">
              <label className="event-look-color">
                <span className="event-look-color-label">Page</span>
                <span className="event-look-color-field">
                  <input
                    type="color"
                    value={page}
                    onChange={(changeEvent) => applyPickedColor(changeEvent.target.value, primary)}
                    className="event-look-color-input"
                    aria-label="Page color"
                  />
                  <span className="event-look-color-hex">{page.toUpperCase()}</span>
                </span>
              </label>
              <label className="event-look-color">
                <span className="event-look-color-label">Accent</span>
                <span className="event-look-color-field">
                  <input
                    type="color"
                    value={primary}
                    onChange={(changeEvent) => applyPickedColor(page, changeEvent.target.value)}
                    className="event-look-color-input"
                    aria-label="Accent color"
                  />
                  <span className="event-look-color-hex">{primary.toUpperCase()}</span>
                </span>
              </label>
            </div>
            <button type="button" className="event-look-reset" onClick={resetFineTune}>
              <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
              Reset colors
            </button>
          </div>

          <div className="event-look-section">
            <p className="event-look-section-label">
              <ImageIcon size={14} weight="bold" aria-hidden="true" />
              Background
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onBackgroundSelected}
            />
            <button
              type="button"
              className={`event-look-drop${backgroundUrl ? " has-image" : " has-color"}`}
              disabled={backgroundPending}
              onClick={() => fileInputRef.current?.click()}
              style={
                backgroundUrl
                  ? undefined
                  : { backgroundColor: page, color: onColorForBackground(page) }
              }
            >
              {backgroundUrl ? (
                <img src={backgroundUrl} alt="" className="event-look-drop-art" />
              ) : (
                <span className="event-look-drop-veil" aria-hidden="true" />
              )}
              <span className="event-look-drop-body">
                {backgroundUrl ? null : <ImageIcon size={22} weight="duotone" aria-hidden="true" />}
                <span className="event-look-drop-title">
                  {backgroundPending
                    ? "Uploading…"
                    : backgroundUrl
                      ? "Replace image"
                      : "Upload image"}
                </span>
                <span className="event-look-drop-hint">JPEG, PNG, WebP, or GIF</span>
              </span>
            </button>
            {backgroundUrl ? (
              <button
                type="button"
                className="event-look-reset"
                disabled={backgroundPending}
                onClick={removeBackground}
              >
                Remove background
              </button>
            ) : null}
            {backgroundError ? <p className="text-sm text-error">{backgroundError}</p> : null}
          </div>

          <div className="event-look-section event-look-section-preview">
            <p className="event-look-section-label">
              <Sparkle size={14} weight="fill" aria-hidden="true" />
              Guest preview
            </p>
            <div className="event-look-preview" style={previewStyle} aria-hidden="true">
              {backgroundUrl ? <img src={backgroundUrl} alt="" className="event-look-preview-art" /> : null}
              <p className="event-look-preview-title">Sample album</p>
              <div className="event-look-preview-flourish">
                <span />
                <Sparkle size={12} weight="fill" />
                <span />
              </div>
              <span className="event-look-preview-cta">Add photos</span>
            </div>
          </div>
        </div>

        <form action={formAction} className="event-look-save">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="presetId" value={presetId} />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="primary" value={primary} />
          <button
            type="submit"
            className="btn-primary event-look-save-btn"
            disabled={pending || backgroundPending}
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {state?.error ? <p className="text-sm text-error">{state.error}</p> : null}
        </form>
      </div>
    </section>
  );
}
