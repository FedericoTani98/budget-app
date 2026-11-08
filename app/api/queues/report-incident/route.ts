import { handleCallback } from "@vercel/queue";
import type { IncidentEvent } from "@/lib/incident-agent";

interface IncidentQueueMessage {
  event: IncidentEvent;
  apiKey: string;
}

const DEFAULT_AGENT_INGEST_URL = "https://budget-app-agents.onrender.com/ingest";
const AGENT_REQUEST_TIMEOUT_MS = 55_000;

// Keep the consumer below the 60-second Hobby function limit. Confirm the
// effective timeout for the Vercel project's plan before relying on this.
export const maxDuration = 60;

export const POST = handleCallback<IncidentQueueMessage>(async ({ event, apiKey }) => {
  const url = process.env.AGENT_INGEST_URL || DEFAULT_AGENT_INGEST_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AGENT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Forward the event identifier for downstream observability. The
        // current agent does not deduplicate this header; queue deliveries
        // are at-least-once and can therefore repeat side effects.
        "Idempotency-Key": event.eventId,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Incident agent responded with status ${response.status}`);
    }

    console.info("Incident delivered: module=%s event_id=%s", event.module, event.eventId);
  } catch (error) {
    console.error(
      "Incident delivery failed: module=%s event_id=%s error_type=%s",
      event.module,
      event.eventId,
      error instanceof Error ? error.name : "UnknownError",
    );
    // Throwing asks Vercel Queues to retry. Because delivery is at-least-once,
    // the downstream agent must implement idempotency before DRY_RUN=false is
    // safe for events that can create issues or send Slack messages.
    throw error;
  } finally {
    clearTimeout(timeout);
  }
});
