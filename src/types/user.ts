/**
 * The local user profile. Persisted in SQLite.
 * API keys are NOT stored here — they live in the OS Keychain.
 */
export interface User {
  firstName: string;
  lastName: string;
}

/** Supported third-party AI providers. */
export type ApiKeyProvider = "anthropic" | "google" | "openai";

/**
 * Tracks whether an API key has been saved for each provider.
 * The actual key value is never held in frontend state — only its presence.
 */
export type ApiKeyStatus = Record<ApiKeyProvider, boolean>;
