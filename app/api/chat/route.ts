import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool } from "ai";
import { z } from "zod";

// Configuriamo il client di OpenRouter usando l'SDK di OpenAI
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
      return new Response(
        JSON.stringify({ error: "Formato messaggi non valido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.it;

    const systemPrompt = `Sei un assistente finanziario personale intelligente e amichevole. 
    Aiuti l'utente ad analizzare le sue spese, entrate e investimenti basandoti su questi dati attuali registrati nell'app:
    ${JSON.stringify(transactions || [])}
    
    Se l'utente chiede esplicitamente di aggiungere una spesa, un'entrata o un investimento, DEVI utilizzare il tool 'addTransaction'.
    ${langInstruction}`;

    const result = streamText({
      // Usiamo un modello gratuito di Qwen su OpenRouter (es. qwen/qwen-2.5-7b-instruct:free)
      model: openrouter("dots-studio/dots-3-note-preview:free"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        addTransaction: tool({
          description: "Aggiunge una nuova transazione (spesa, entrata o investimento) nell'applicazione dell'utente.",
          parameters: z.object({
            type: z.enum(["spese", "entrate", "investimenti"]).describe("Tipo di movimento: spese, entrate o investimenti"),
            amount: z.number().describe("Importo numerico della transazione"),
            description: z.string().describe("Descrizione o causale del movimento (es. caffè, stipendio, azioni)"),
            categoryId: z.string().optional().describe("ID opzionale della categoria"),
          }),
        }),
      },
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