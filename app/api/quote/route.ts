import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD, opzionale

  if (!symbol) {
    return NextResponse.json({ error: "Simbolo mancante" }, { status: 400 });
  }

  try {
    // Con "date": prezzo storico (chiusura) di quel giorno, o del giorno di
    // scambio precedente più vicino se è un weekend/festivo di borsa chiusa.
    if (dateParam) {
      const targetDate = new Date(`${dateParam}T00:00:00Z`);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: "Data non valida" }, { status: 400 });
      }

      // Margine di qualche giorno prima, per avere comunque un dato
      // se la data cade di sabato/domenica o in un giorno festivo.
      const period1 = new Date(targetDate);
      period1.setUTCDate(period1.getUTCDate() - 7);
      const period2 = new Date(targetDate);
      period2.setUTCDate(period2.getUTCDate() + 1);

      const result = await yahooFinance.chart(symbol, {
        period1,
        period2,
        interval: "1d",
      });

      const quotes = (result.quotes || []).filter((q: any) => q.close != null);
      if (quotes.length === 0) {
        return NextResponse.json(
          { error: "Nessuna quotazione storica trovata per questa data" },
          { status: 404 }
        );
      }

      // Ultima chiusura disponibile in corrispondenza o prima della data richiesta.
      const onOrBefore = quotes.filter((q: any) => new Date(q.date) <= period2);
      const chosen = onOrBefore[onOrBefore.length - 1] || quotes[quotes.length - 1];

      return NextResponse.json({
        symbol,
        regularMarketPrice: chosen.close,
        currency: (result as any).meta?.currency || "USD",
        date: chosen.date,
      });
    }

    // Senza "date": prezzo corrente (comportamento di prima)
    const quote = await yahooFinance.quote(symbol);
    return NextResponse.json({
      symbol,
      regularMarketPrice: quote.regularMarketPrice,
      currency: quote.currency,
      regularMarketChangePercent: quote.regularMarketChangePercent,
    });
  } catch (error) {
    console.error("Errore /api/quote:", error);
    return NextResponse.json({ error: "Errore nel recupero del dato" }, { status: 500 });
  }
}