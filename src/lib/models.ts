import type { ApiKeyProvider } from "../types/user";

export interface KnownModel {
  id: string;
  label: string;
  provider: ApiKeyProvider;
}

/**
 * Static list of known LLM models available for club members.
 *
 * MAINTENANCE NOTE: Providers add and remove models frequently.
 * When a model is retired, mark it deprecated rather than removing it so
 * that existing members that reference it still display correctly.
 * Deprecated models should be filtered out of the creation dropdown but
 * still rendered in read-only views.
 */
export const KNOWN_MODELS: KnownModel[] = [
  // Anthropic
  { id: "claude-opus-4-6",            label: "Claude Opus 4.6",    provider: "anthropic" },
  { id: "claude-sonnet-4-6",          label: "Claude Sonnet 4.6",  provider: "anthropic" },
  { id: "claude-haiku-4-5-20251001",  label: "Claude Haiku 4.5",   provider: "anthropic" },
  // OpenAI
  { id: "gpt-4o",       label: "GPT-4o",       provider: "openai" },
  { id: "gpt-4o-mini",  label: "GPT-4o Mini",  provider: "openai" },
  { id: "o1",           label: "o1",            provider: "openai" },
  { id: "o3-mini",      label: "o3-mini",       provider: "openai" },
  // Google
  { id: "gemini-2.0-flash",  label: "Gemini 2.0 Flash",  provider: "google" },
  { id: "gemini-1.5-pro",    label: "Gemini 1.5 Pro",    provider: "google" },
  { id: "gemini-1.5-flash",  label: "Gemini 1.5 Flash",  provider: "google" },
];

/** Returns the display label for a model ID, falling back to the raw ID if unknown. */
export function modelLabel(modelId: string): string {
  return KNOWN_MODELS.find((m) => m.id === modelId)?.label ?? modelId;
}
