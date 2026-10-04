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

function summarizeTransactions(transactions: any[] = []) {
  const safeTx = Array.isArray(transactions) ? transactions : [];

  const totals = safeTx.reduce(
    (acc, tx) => {
      if (!tx || typeof tx.amount !== "number") return acc;

      acc.total += tx.amount;

      if (tx.type === "entrate") acc.income += tx.amount;
      if (tx.type === "spese") acc.expenses += tx.amount;
      if (tx.type === "investimenti") acc.investments += tx.amount;

      return acc;
    },
    { total: 0, income: 0, expenses: 0, investments: 0 }
  );

  const categorySummary: Record<string, number> = {};
  for (const tx of safeTx) {
    if (!tx || typeof tx.amount !== "number") continue;
    const key = String(tx.categoryId || "altro");
    categorySummary[key] = (categorySummary[key] || 0) + tx.amount;
  }

  const topCategories = Object.entries(categorySummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const recentTx = safeTx
    .slice(0, 10)
    .map((tx) => ({
      type: tx?.type,
      amount: tx?.amount,
      categoryId: tx?.categoryId,
      date: tx?.date,
      description: tx?.description,
    }));

  return {
    totalTransactions: safeTx.length,
    totals,
    topCategories,
    recentTx,
    createdAt: new Date().toISOString(),
  };
}

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
    const safeSummary = summarizeTransactions(transactions);

    const systemPrompt = `Sei un assistente finanziario personale intelligente e amichevole.
    Analizza solo un riassunto anonimo e aggregato dei dati dell'utente, non tutti i dettagli finanziari individuali.
    Dati disponibili:
    ${JSON.stringify(safeSummary)}

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
