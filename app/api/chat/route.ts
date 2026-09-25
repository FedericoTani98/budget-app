import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, transactions } = body;

    if (!Array.isArray(messages)) {
      console.error("messages non è un array! Tipo ricevuto:", typeof messages, messages);
      return new Response(
        JSON.stringify({ error: "Formato messaggi non valido ricevuto dal client" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Sei un assistente finanziario personale intelligente e amichevole. 
    Aiuti l'utente ad analizzare le sue spese, entrate e investimenti basandoti su questi dati attuali registrati nell'app:
    ${JSON.stringify(transactions || [])}
    
    Rispondi sempre in italiano in modo chiaro, conciso e utile.`;

    const result = streamText({
      model: google("gemini-3.8-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages), // <-- AGGIUNTO await
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("ERRORE NELLA CHAT API:", error);
    return new Response(JSON.stringify({ error: error.message || "Errore interno del server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}