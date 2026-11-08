import { handleCallback } from "@vercel/queue";
import type { IncidentEvent } from "@/lib/incident-agent";

interface IncidentQueueMessage {
  event: IncidentEvent;
}

interface IncidentAgentResult {
  status?: string;
  triage?: { severity?: string };
  actions?: { issue?: string };
}

const DEFAULT_AGENT_INGEST_URL = "https://budget-app-agents.onrender.com/ingest";
const AGENT_REQUEST_TIMEOUT_MS = 55_000;

// Keep the consumer below the 60-second Hobby function limit. Confirm the
// effective timeout for the Vercel project's plan before relying on this.
export const maxDuration = 60;

const allowedStatuses = new Set(["alerted", "dry_run", "triaged", "duplicate"]);
const allowedSeverities = new Set(["low", "medium", "high", "critical"]);
const allowedIssueStatuses = new Set([
  "created",
  "failed",
  "not_created",
  "would_be_created",
]);

function safeValue(value: unknown, allowed: Set<string>): string {
  return typeof value === "string" && allowed.has(value) ? value : "unknown";
}

export const POST = handleCallback<IncidentQueueMessage>(async ({ event }) => {
  const apiKey = process.env.AGENT_API_KEY;
  if (!apiKey) {
    // Fail the delivery so Vercel Queues can retry after configuration is fixed.
    throw new Error("AGENT_API_KEY is not configured for the queue consumer");
  }

  const url = process.env.AGENT_INGEST_URL || DEFAULT_AGENT_INGEST_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AGENT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Forward the stable event ID. The Render agent must persist and
        // enforce this key before retries are safe with side effects enabled.
        "Idempotency-Key": event.eventId,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Incident agent responded with status ${response.status}`);
    }

    let result: IncidentAgentResult = {};
    try {
      result = (await response.json()) as IncidentAgentResult;
    } catch {
      // Do not log the response body; it may contain sensitive information.
    }

    console.info(
      "Incident agent result: module=%s event_id=%s status=%s severity=%s issue=%s",
      event.module,
      event.eventId,
      safeValue(result.status, allowedStatuses),
      safeValue(result.triage?.severity, allowedSeverities),
      safeValue(result.actions?.issue, allowedIssueStatuses),
    );
    console.info("Incident delivered: module=%s event_id=%s", event.module, event.eventId);
  } catch (error) {
    console.error(
      "Incident delivery failed: module=%s event_id=%s error_type=%s",
      event.module,
      event.eventId,
      error instanceof Error ? error.name : "UnknownError",
    );
    // Vercel Queues uses at-least-once delivery. A retry can repeat downstream
    // side effects unless the agent deduplicates event.eventId persistently.
    throw error;
  } finally {
    clearTimeout(timeout);
  }
});
