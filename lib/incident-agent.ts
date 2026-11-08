export type IncidentEventType =
  | "frontend_error"
  | "api_error"
  | "budget_calculation_error"
  | "transaction_mismatch"
  | "balance_inconsistency";

export interface IncidentEvent {
  eventId: string;
  eventType: IncidentEventType;
  module: string;
  message: string;
  timestamp: string;
}

const INCIDENT_TOPIC = "incident-events";

/**
 * Queue a minimal, non-sensitive server-side error event for asynchronous
 * delivery to the incident agent. Never include request bodies, user data,
 * provider error messages, stacks, or credentials in queue messages.
 */
export async function reportIncident(
  eventType: IncidentEventType,
  module: string,
  message: string,
  error?: unknown,
): Promise<void> {
  if (!process.env.AGENT_API_KEY) {
    console.warn("Incident agent not configured: AGENT_API_KEY is missing");
    return;
  }

  const event: IncidentEvent = {
    eventId: crypto.randomUUID(),
    eventType,
    module,
    message: `${message} (error_type=${error instanceof Error ? error.name : "UnknownError"})`,
    timestamp: new Date().toISOString(),
  };

  try {
    const { send } = await import("@vercel/queue");
    // Keep only the event in durable queue storage. The consumer obtains the
    // secret from its server-side AGENT_API_KEY environment variable.
    await send(INCIDENT_TOPIC, { event });
    console.info("Incident queued: module=%s event_id=%s", module, event.eventId);
  } catch (queueError) {
    // Queueing failures must not replace the original API response.
    console.warn(
      "Incident queue publish failed: module=%s error_type=%s",
      module,
      queueError instanceof Error ? queueError.name : "UnknownError",
    );
  }
}
