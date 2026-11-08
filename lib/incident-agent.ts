type IncidentEventType =
  | "frontend_error"
  | "api_error"
  | "budget_calculation_error"
  | "transaction_mismatch"
  | "balance_inconsistency";

interface IncidentEvent {
  eventType: IncidentEventType;
  module: string;
  message: string;
  timestamp: string;
}

const DEFAULT_AGENT_INGEST_URL = "https://budget-app-agents.onrender.com/ingest";
const REPORT_TIMEOUT_MS = 2500;

/**
 * Send a minimal, non-sensitive server-side error event to the incident agent.
 * Never include request bodies, user data, provider error messages, or stacks.
 */
export async function reportIncident(
  eventType: IncidentEventType,
  module: string,
  message: string,
  error?: unknown,
): Promise<void> {
  const apiKey = process.env.AGENT_API_KEY;
  if (!apiKey) {
    console.warn("Incident agent not configured: AGENT_API_KEY is missing");
    return;
  }

  const url = process.env.AGENT_INGEST_URL || DEFAULT_AGENT_INGEST_URL;
  const event: IncidentEvent = {
    eventType,
    module,
    message: `${message} (error_type=${error instanceof Error ? error.name : "UnknownError"})`,
    timestamp: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Incident agent rejected event: status=%s module=%s", response.status, module);
    }
  } catch (reportError) {
    // Reporting must not break the original API response; do not log URL or credentials.
    console.warn(
      "Incident agent request failed: module=%s error_type=%s",
      module,
      reportError instanceof Error ? reportError.name : "UnknownError",
    );
  } finally {
    clearTimeout(timeout);
  }
}
