use serde::{Deserialize, Serialize};

use crate::keychain::get_api_key_internal;

const ANTHROPIC_VERSION: &str = "2023-06-01";

/// A single model entry returned by the Anthropic /v1/models endpoint.
#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicModel {
    pub id: String,
    pub display_name: String,
    pub created_at: String,
}

/// Raw API response shape — only the fields we need.
#[derive(Debug, Deserialize)]
struct ModelsResponse {
    data: Vec<AnthropicModel>,
}

/// Returns the list of models available on the caller's Anthropic account.
///
/// Returns an empty list if no API key is stored — the frontend treats
/// an empty list as "no key configured" and shows an appropriate message.
/// Returns Err only for network or unexpected API errors.
#[tauri::command]
pub async fn list_anthropic_models() -> Result<Vec<AnthropicModel>, String> {
    let key = match get_api_key_internal("anthropic")? {
        Some(k) => k,
        // No key stored — return empty list so the frontend can react gracefully.
        None => return Ok(vec![]),
    };

    let response = reqwest::Client::new()
        .get("https://api.anthropic.com/v1/models")
        .header("anthropic-version", ANTHROPIC_VERSION)
        .header("x-api-key", &key)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        // Non-200 means the key is invalid or the account has no access.
        // Return empty list so the dropdown can show the "no valid keys" message.
        return Ok(vec![]);
    }

    let body = response
        .json::<ModelsResponse>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(body.data)
}
