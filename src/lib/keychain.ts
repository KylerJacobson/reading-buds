import { invoke } from "@tauri-apps/api/core";
import type { ApiKeyProvider } from "../types/user";

/** Saves an API key to the OS Keychain for the given provider. */
export async function setApiKey(
  provider: ApiKeyProvider,
  key: string
): Promise<void> {
  await invoke("set_api_key", { provider, key });
}

/**
 * Returns the stored API key for the given provider, or null if not set.
 * Keys are stored in the OS Keychain and never written to disk by this app.
 */
export async function getApiKey(
  provider: ApiKeyProvider
): Promise<string | null> {
  return await invoke<string | null>("get_api_key", { provider });
}

/** Removes the stored API key for the given provider. */
export async function deleteApiKey(provider: ApiKeyProvider): Promise<void> {
  await invoke("delete_api_key", { provider });
}
