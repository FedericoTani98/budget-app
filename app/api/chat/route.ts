import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";

// Su Vercel (piano Hobby) le funzioni hanno un limite di 10s di default:
// se il modello ci mette di più, la richiesta viene interrotta a metà senza
// un errore chiaro lato client. Questo lo estende fino a 60s.
export const maxDuration = 60;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  it: "Rispondi sempre in italiano, in modo chiaro, conciso e utile.",
  en: "Always respond in English, clearly, concisely and helpfully.",
  pl: "Zawsze odpowiadaj po polsku, w sposób jasny, zwięzły i pomocny.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, transactions, language } = body;

    if (!Array.isArray(messages)) {
      console.error("messages non è un array! Tipo ricevuto:", typeof messages, messages);
      return new Response(
        JSON.stringify({ error: "Formato messaggi non valido ricevuto dal client" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.it;

    const systemPrompt = `Sei un assistente finanziario personale intelligente e amichevole.
    Aiuti l'utente ad analizzare le sue spese, entrate e investimenti basandoti su questi dati attuali registrati nell'app:
    ${JSON.stringify(transactions || [])}

    ${langInstruction}`;

    const result = streamText({
      model: openrouter("dots-studio/dots-3-note-preview:free"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
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