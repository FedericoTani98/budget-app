import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";

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
      model: google("gemini-3.8-flash"),
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