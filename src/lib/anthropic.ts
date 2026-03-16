import { invoke } from "@tauri-apps/api/core";

export interface AnthropicModel {
  id: string;
  displayName: string;
  createdAt: string;
}

/**
 * Fetches the list of models available on the stored Anthropic API key.
 * Returns an empty array if no key is configured or the key is invalid.
 */
export async function listAnthropicModels(): Promise<AnthropicModel[]> {
  const models = await invoke<{ id: string; display_name: string; created_at: string }[]>(
    "list_anthropic_models"
  );
  // Map snake_case from Rust to camelCase for the frontend.
  return models.map((m) => ({
    id: m.id,
    displayName: m.display_name,
    createdAt: m.created_at,
  }));
}
