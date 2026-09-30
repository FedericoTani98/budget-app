import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, transactions, language } = body;

    const result = streamText({
      model: openrouter("dots-studio/dots-3-note-preview:free"),
      system: `Sei un assistente finanziario personale. Dati attuali: ${JSON.stringify(transactions || [])}`,
      messages: await convertToModelMessages(messages),
      tools: {
        addTransaction: tool({
          description: "Aggiunge una nuova transazione (spese, entrate o investimenti).",
          parameters: z.object({
            type: z.enum(["spese", "entrate", "investimenti"]),
            amount: z.number(),
            description: z.string(),
            categoryId: z.string().optional(),
          }),
        } as any), // 👈 Questo bypassa il controllo rigido dei tipi di TypeScript
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("ERRORE API:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}