# 💰 Budget App

Una web app personale per tracciare spese, entrate e investimenti, con un assistente finanziario AI integrato.

## ✨ Funzionalità

- **Gestione movimenti**: aggiungi, modifica ed elimina spese, entrate e investimenti
- **Categorie personalizzabili**: categorie predefinite + possibilità di crearne di nuove con icona e colore a scelta
- **Filtri temporali**: visualizza i movimenti per giorno, settimana, mese, anno o storico completo
- **Dashboard visuale**: grafico a ciambella per categoria, confronto entrate/spese/investimenti, patrimonio totale e liquidità
- **Assistente AI**: chatbot integrato che risponde a domande in linguaggio naturale sui dati disponibili
- **Gestione agentica degli incidenti**: gli errori server selezionati vengono messi in coda, analizzati da un servizio agentico e, in base alla severità, possono generare issue GitHub e notifiche Slack
- **Persistenza locale**: i dati dell'app sono salvati nel `localStorage` del browser, nessun account richiesto
- **UI mobile-first**: interfaccia ottimizzata per smartphone, in italiano

## 🛠️ Stack tecnico

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: React + Tailwind CSS
- **AI**: AI SDK e provider configurato nelle route server
- **Storage app**: `localStorage` (nessun database esterno per i dati dell'app)
- **Incident queue**: [Vercel Queues](https://vercel.com/docs/queues)
- **Agent orchestrator**: servizio Python/FastAPI separato, ospitabile su Render

## 🚨 Gestione agentica degli incidenti e coda

La gestione degli incidenti è asincrona: la richiesta dell'utente non deve attendere il triage, la creazione di issue o l'invio delle notifiche.

1. Una route server rileva un errore gestito e chiama `reportIncident` (`lib/incident-agent.ts`). Attualmente, per esempio, la chat e il recupero delle quotazioni segnalano alcuni errori interni.
2. L'app crea un `eventId` UUID e accoda su Vercel Queues un evento minimo con `eventType`, `module`, messaggio privo di dettagli sensibili e timestamp. Non mette in coda request body, dati dell'utente, stack trace, messaggi grezzi dei provider o credenziali.
3. Il consumer `app/api/queues/report-incident/route.ts`, attivato dal topic `incident-events` configurato in `vercel.json`, invia l'evento al servizio agentico via `POST /ingest`, con autenticazione Bearer e `Idempotency-Key` uguale all'`eventId`.
4. Il servizio agentico (repository [budget-app-agents](https://github.com/FedericoTani98/budget-app-agents)) autentica la richiesta, deduplica l'ID e usa Gemini per classificare severità, categoria e riepilogo.
5. Con `DRY_RUN=true`, l'agent restituisce le azioni che farebbe senza creare issue né inviare Slack. Con `DRY_RUN=false`, le severità `medium`, `high` e `critical` attivano un tentativo di creazione issue GitHub e una notifica Slack. `low` non attiva queste azioni. L'azione GitHub e quella Slack vengono tentate indipendentemente: un errore su una non impedisce il tentativo dell'altra.
6. Il consumer Vercel registra un risultato ridotto e non sensibile, per esempio `status`, `severity` e stato issue, senza stampare il corpo completo della risposta.

La classificazione è una decisione del modello, non una garanzia: lo stesso tipo di errore può ricevere severità diverse in base alle informazioni dell'evento. `Incident delivered` nei log Vercel significa che il consumer ha ricevuto una risposta HTTP di successo; per vedere il risultato controllare la riga `Incident agent result` e, per eventuali errori di integrazione GitHub/Slack, i log Render.

### Configurazione

Configura i segreti nelle impostazioni dei rispettivi ambienti, senza committarli nel repository.

**Vercel (Production e/o Preview secondo necessità):**

- `AGENT_API_KEY`: chiave condivisa; deve corrispondere a `APP_API_KEY` su Render.
- `AGENT_INGEST_URL`: URL pubblico del servizio agent, completo di `/ingest`, per esempio `https://<servizio-render>.onrender.com/ingest`. Se omesso, l'app usa il default definito nel consumer; impostarlo esplicitamente evita di inviare eventi a un servizio Render diverso da quello atteso.
- Le credenziali e la configurazione necessarie alla coda Vercel devono essere disponibili per il progetto secondo la configurazione del provider.

**Servizio agentico (Render):**

- `APP_API_KEY`: la stessa chiave configurata come `AGENT_API_KEY` su Vercel.
- `GEMINI_API_KEY`: credenziale per il triage Gemini.
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`: autorizzano e indicano il repository in cui creare le issue.
- `SLACK_WEBHOOK_URL`: webhook del canale che riceve gli avvisi.
- `DRY_RUN`: impostare `true` per provare senza effetti esterni; solo dopo aver verificato configurazione e comportamento, impostare `false` per abilitare issue e Slack.
- `IDEMPOTENCY_FILE` (opzionale): percorso del file che conserva gli ID già elaborati. Il default è `data/processed_incidents.txt`.

Dopo aver modificato variabili Vercel o Render, verifica il redeploy del servizio corrispondente. Mantieni separati gli endpoint e le credenziali di test e produzione. Un evento `medium` può creare un'issue e inviare Slack quando `DRY_RUN=false`; verifica prima destinazione GitHub e webhook.

### Affidabilità e deduplicazione

Vercel Queues usa consegna *at-least-once*: in caso di timeout o errore la stessa consegna può essere ritentata. Il servizio agentico usa `eventId`/`Idempotency-Key` per ignorare gli ID già registrati. Attualmente il registro predefinito è un file sul filesystem Render: senza Persistent Disk o storage condiviso, può essere effimero, andare perso a un redeploy e non essere condiviso tra più istanze. Non garantisce quindi deduplicazione durevole o esecuzione esattamente una volta degli effetti esterni. Per un carico di produzione, usare un database o storage persistente/condiviso e considerare che un crash durante issue/Slack può richiedere verifica manuale.

### Verifica

Per un test end-to-end usa prima un ambiente di test, con `DRY_RUN=true`, un repository GitHub di prova e un webhook Slack di prova. Genera un evento sintetico dall'app e controlla:

- Vercel: `Incident queued`, quindi `Incident agent result` con `status`, `severity` e `issue`.
- Render: `POST /ingest` con risposta `200 OK`, log Gemini e gli eventuali errori `Creazione issue GitHub fallita` o `Invio notifica Slack fallito`.

Un `200 OK` indica che la richiesta è stata elaborata, non necessariamente che sia stata creata un'issue. Con `DRY_RUN=true`, il risultato atteso per severità che attivano un alert è `status=dry_run`, `issue=would_be_created` e Slack `would_be_sent`.

## 🚀 Setup locale

### Prerequisiti

- Node.js 22 o superiore
- Chiavi API richieste dalle route server abilitate e, se si vuole verificare la pipeline incidenti, un ambiente agentico di test

### Installazione

```bash
git clone https://github.com/<tuo-utente>/budget-app.git
cd budget-app
npm install
```

### Configurazione

Crea un file `.env.local` nella root del progetto e inserisci solo le variabili necessarie alle funzionalità che vuoi eseguire. Per la pipeline agentica:

```dotenv
AGENT_API_KEY=chiave-condivisa-con-il-servizio-agent
AGENT_INGEST_URL=https://<servizio-render-di-test>.onrender.com/ingest
```

Aggiungi anche le chiavi richieste dagli altri provider usati nelle route. Non committare mai `.env.local`: contiene segreti ed è escluso dal `.gitignore` di Next.js. Non usare credenziali di produzione per test locali.

### Avvio

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000). La coda e il consumer dipendono dalla configurazione Vercel e potrebbero non funzionare in locale senza un ambiente di coda compatibile.

## 📦 Build di produzione

```bash
npm run build
npm run start
```

## ☁️ Deploy

L'app è pensata per essere pubblicata su [Vercel](https://vercel.com):

1. Importa il repository GitHub su Vercel.
2. Configura le variabili d'ambiente richieste dall'app e, se attiva la pipeline incidenti, `AGENT_API_KEY` e `AGENT_INGEST_URL`.
3. Configura il servizio agentico separato su Render e le sue variabili d'ambiente. Usa la stessa chiave condivisa, ma non esporla mai al browser.
4. Verifica che il trigger `incident-events` in `vercel.json` sia deployato.
5. Dopo aver verificato l'ambiente di test, promuovi il deploy e configura Production in modo esplicito.

Ogni push su `main` aggiorna il deploy collegato, secondo le impostazioni del progetto Vercel.

## 📁 Struttura del progetto

```
app/
├── page.tsx                         # Dashboard, modali e chat
└── api/
    ├── chat/route.ts                # API chat e segnalazione degli errori gestiti
    ├── quote/route.ts               # API quotazioni e segnalazione degli errori gestiti
    └── queues/report-incident/route.ts # Consumer Vercel della coda incidenti
lib/
└── incident-agent.ts                # Payload minimo e pubblicazione su Vercel Queues
vercel.json                          # Trigger del topic incident-events
```

## 📝 Licenza

Progetto personale — nessuna licenza specifica.
