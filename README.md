# 💰 Budget App

Una web app personale per tracciare spese, entrate e investimenti, con un assistente finanziario AI integrato basato su Google Gemini.

## ✨ Funzionalità

- **Gestione movimenti**: aggiungi, modifica ed elimina spese, entrate e investimenti
- **Categorie personalizzabili**: categorie predefinite + possibilità di crearne di nuove con icona e colore a scelta
- **Filtri temporali**: visualizza i movimenti per giorno, settimana, mese, anno o storico completo
- **Dashboard visuale**: grafico a ciambella per categoria, confronto entrate/spese/investimenti, patrimonio totale e liquidità
- **Assistente AI**: chatbot integrato (Google Gemini) che analizza i tuoi dati finanziari in tempo reale e risponde a domande in linguaggio naturale (es. *"Quanto ho speso questo mese in alimentari?"*)
- **Persistenza locale**: tutti i dati sono salvati nel `localStorage` del browser, nessun account richiesto
- **UI mobile-first**: interfaccia ottimizzata per smartphone, in italiano

## 🛠️ Stack tecnico

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: React + Tailwind CSS
- **AI**: [AI SDK by Vercel](https://ai-sdk.dev/) + [@ai-sdk/google](https://ai-sdk.dev/providers/ai-sdk-providers/google) (Gemini)
- **Storage**: `localStorage` (nessun database esterno)

## 🚀 Setup locale

### Prerequisiti

- Node.js 22 o superiore
- Una API key di Google AI Studio ([ottienila qui](https://aistudio.google.com/apikey))

### Installazione

```bash
git clone https://github.com/<tuo-utente>/budget-app.git
cd budget-app
npm install
```

### Configurazione

Crea un file `.env.local` nella root del progetto:

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=la-tua-chiave-api
```

> ⚠️ Non committare mai questo file: contiene una chiave segreta. È già escluso di default dal `.gitignore` di Next.js.

### Avvio

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000).

## 📦 Build di produzione

```bash
npm run build
npm run start
```

## ☁️ Deploy

L'app è pensata per essere pubblicata su [Vercel](https://vercel.com):

1. Importa il repository da GitHub su Vercel
2. Aggiungi la variabile d'ambiente `GOOGLE_GENERATIVE_AI_API_KEY` nelle Project Settings
3. Fai il deploy — ogni push su `main` aggiorna automaticamente la versione live

## 📁 Struttura del progetto

```
app/
├── page.tsx           # Componente principale (dashboard, modali, chat)
└── api/
    └── chat/
        └── route.ts   # Endpoint API che comunica con Gemini
```

## 📝 Licenza

Progetto personale — nessuna licenza specifica.