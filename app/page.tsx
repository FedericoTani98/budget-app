"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";








const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PRESET_ICONS = [
  "🛒", "🧾", "🍔", "👕", "⛱️", "🚗", "🏠", "💡", 
  "💊", "🎮", "🏋️", "📱", "🎁", "✈️", "☕", "🎓", 
  "🐾", "💼", "💸", "📈", "₿", "👴", "🛠️", "🎬",
  "📁", "📄", "🗑️", "📦", "🏷️", "🍕"
];

const PRESET_COLORS = [
  "#22c55e", "#ef4444", "#3b82f6", "#f97316", 
  "#a855f7", "#ec4899", "#06b6d4", "#eab308", 
  "#64748b", "#10b981", "#8b5cf6", "#f43f5e"
];

const DEFAULT_CATEGORIES = {
  spese: [
    { id: "alimentari", label: "Alimentari", icon: "🛒", color: "#22c55e" },
    { id: "bollette", label: "Bollette", icon: "🧾", color: "#ef4444" },
    { id: "uscite", label: "Uscite fuori", icon: "🍔", color: "#f97316" },
    { id: "shopping", label: "Shopping", icon: "👕", color: "#3b82f6" },
    { id: "vacanza", label: "Vacanza", icon: "⛱️", color: "#eab308" },
    { id: "auto", label: "Auto/Trasporti", icon: "🚗", color: "#64748b" },
    { id: "altro", label: "Altro", icon: "📁", color: "#64748b" },
  ],
  entrate: [
    { id: "stipendio", label: "Stipendio", icon: "💼", color: "#10b981" },
    { id: "rimborsi", label: "Rimborsi", icon: "💸", color: "#06b6d4" },
    { id: "regali", label: "Regali", icon: "🎁", color: "#ec4899" },
    { id: "altro", label: "Altro", icon: "📁", color: "#64748b" },
  ],
  investimenti: [
    { id: "etf", label: "Azioni/ETF", icon: "📈", color: "#3b82f6" },
    { id: "crypto", label: "Crypto", icon: "₿", color: "#eab308" },
    { id: "fondo", label: "Fondo Pensione", icon: "👴", color: "#a855f7" },
    { id: "altro", label: "Altro", icon: "📁", color: "#64748b" },
  ]
};

// Traduzioni delle etichette delle categorie di default (id -> label per lingua).
// Le categorie create o personalizzate dall'utente mantengono invece il nome digitato.
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  it: {
    alimentari: "Alimentari", bollette: "Bollette", uscite: "Uscite fuori",
    shopping: "Shopping", vacanza: "Vacanza", auto: "Auto/Trasporti",
    stipendio: "Stipendio", rimborsi: "Rimborsi", regali: "Regali",
    etf: "Azioni/ETF", crypto: "Crypto", fondo: "Fondo Pensione",
    altro: "Altro",
  },
  en: {
    alimentari: "Groceries", bollette: "Bills", uscite: "Dining Out",
    shopping: "Shopping", vacanza: "Vacation", auto: "Car/Transport",
    stipendio: "Salary", rimborsi: "Reimbursements", regali: "Gifts",
    etf: "Stocks/ETF", crypto: "Crypto", fondo: "Pension Fund",
    altro: "Other",
  },
  pl: {
    alimentari: "Zakupy spożywcze", bollette: "Rachunki", uscite: "Jedzenie na mieście",
    shopping: "Zakupy", vacanza: "Wakacje", auto: "Samochód/Transport",
    stipendio: "Wynagrodzenie", rimborsi: "Zwroty", regali: "Prezenty",
    etf: "Akcje/ETF", crypto: "Krypto", fondo: "Fundusz emerytalny",
    altro: "Inne",
  },
};

const DATE_LOCALE: Record<string, string> = {
  it: "it-IT",
  en: "en-US",
  pl: "pl-PL",
};

const LANGUAGE_META: Record<string, { flag: string; name: string }> = {
  it: { flag: "🇮🇹", name: "Italiano" },
  en: { flag: "🇬🇧", name: "English" },
  pl: { flag: "🇵🇱", name: "Polski" },
};

type Lang = "it" | "en" | "pl";

const TRANSLATIONS: Record<Lang, any> = {
  it: {
    patrimonioTotale: "Patrimonio Totale",
    liquidita: "Liquidità",
    investitiLabel: "Investiti",
    tabSpese: "Spese",
    tabEntrate: "Entrate",
    tabInvest: "Invest.",
    periodGiorno: "Giorno",
    periodSettimana: "Settimana",
    periodMese: "Mese",
    periodAnno: "Anno",
    periodTutti: "Tutti",
    confrontoPeriodo: "Confronto Periodo",
    nessunMovimento: "Nessun movimento registrato in questo periodo.",
    modifica: "Modifica",
    modificaMovimento: "Modifica Movimento",
    nuovaUscita: "Nuova Uscita",
    nuovaEntrata: "Nuova Entrata",
    nuovoInvestimento: "Nuovo Investimento",
    importoLabel: "Importo (€)",
    dataLabel: "Data",
    descrizioneLabel: "Descrizione / Note",
    descrizionePlaceholder: "Es. Spesa Conad, ETF...",
    selezionaCategoria: "Seleziona Categoria",
    nuovaCategoriaBtn: "+ Nuova Categoria",
    eliminaBtn: "Elimina",
    salvaBtn: "Salva",
    aggiornaBtn: "Aggiorna",
    creaCategoriaTitle: "Crea Categoria",
    nomeCategoriaLabel: "Nome Categoria",
    nomeCategoriaPlaceholder: "Es. Palestra, Regali...",
    scegliIconaLabel: "Scegli Icona",
    scegliColoreLabel: "Scegli Colore",
    annullaBtn: "Annulla",
    creaBtn: "Crea",
    assistenteFinanziario: "Assistente Finanziario",
    analizzaDati: "Analizza i tuoi dati in tempo reale",
    chatWelcome: "👋 Ciao! Chiedimi qualsiasi cosa sul tuo budget.",
    chatExample: 'Es: "Quanto ho speso 3 giorni fa?", "Qual è la mia spesa maggiore questo mese?"',
    chatPlaceholder: "Chiedi all'AI...",
    inviaBtn: "Invia",
    analizzando: "Sto analizzando i tuoi dati...",
    tuttiMovimenti: "Tutti i movimenti",
    settimanaDelPrefix: "Settimana del",
    lingua: "Lingua",
    installTitle: "Installa l'app",
    installDesc: "Aggiungila alla schermata Home per usarla a schermo intero, come un'app vera.",
    installIosSteps: 'Cerca l\'icona "Condividi" (un quadrato con una freccia verso l\'alto ⬆️) nel tuo browser, toccala, poi scegli "Aggiungi a schermata Home". Su iPhone/iPad si trova di solito nella barra in alto o in basso a seconda del browser.',
    installAndroidSteps: 'Tocca il menu del browser (⋮ in alto a destra) e scegli "Aggiungi a schermata Home" o "Installa app".',
    installBtn: "Installa",
    installDismiss: "Non ora",
    backupBtn: "Backup dati",
    esportaBtn: "Esporta backup",
    importaBtn: "Importa backup",
    backupDesc: "Esporta un file di backup prima di installare l'app o cambiare dispositivo, poi importalo per recuperare i tuoi dati.",
    importSuccess: "Dati importati con successo!",
    importError: "File non valido o corrotto. Riprova con un backup esportato da questa app.",
    modificaCategoriaTitle: "Modifica Categoria",
    eliminaCategoriaBtn: "Elimina Categoria",
    confermaEliminaCatTitle: "Elimina Categoria",
    confermaEliminaCatMsg: (count: number, label: string) =>
      count > 0
        ? `Sei sicuro di voler eliminare la categoria "${label}"? Ci sono ${count} ${count === 1 ? "movimento associato che verrà spostato" : "movimenti associati che verranno spostati"} nella categoria "Altro".`
        : `Sei sicuro di voler eliminare la categoria "${label}"?`,
    nonEliminabile: "Categoria predefinita non eliminabile",
    generatedIn: "Risposta generata in", 
    with: "con",
    elaborando: "L'assistente sta elaborando la risposta...",
    tickerLabel: "Ticker (opzionale)",
    tickerPlaceholder: "Es. AAPL, VWCE.MI",
    tickerHint: "Se inserito, traccia l'andamento % rispetto al prezzo di oggi.",
    tickerNotFound: "Ticker non trovato o quotazione non disponibile. Controlla il simbolo o lascia il campo vuoto.",
    savingTicker: "Verifico il ticker...",
    refreshingQuotes: "Aggiorno le quotazioni...",
    aggiornaQuotazioniBtn: "Aggiorna quotazioni",
  },
  en: {
    patrimonioTotale: "Total Net Worth",
    liquidita: "Liquidity",
    investitiLabel: "Invested",
    tabSpese: "Expenses",
    tabEntrate: "Income",
    tabInvest: "Invest.",
    periodGiorno: "Day",
    periodSettimana: "Week",
    periodMese: "Month",
    periodAnno: "Year",
    periodTutti: "All",
    confrontoPeriodo: "Period Comparison",
    nessunMovimento: "No transactions recorded in this period.",
    modifica: "Edit",
    modificaMovimento: "Edit Transaction",
    nuovaUscita: "New Expense",
    nuovaEntrata: "New Income",
    nuovoInvestimento: "New Investment",
    importoLabel: "Amount (€)",
    dataLabel: "Date",
    descrizioneLabel: "Description / Notes",
    descrizionePlaceholder: "E.g. Groceries, ETF...",
    selezionaCategoria: "Select Category",
    nuovaCategoriaBtn: "+ New Category",
    eliminaBtn: "Delete",
    salvaBtn: "Save",
    aggiornaBtn: "Update",
    creaCategoriaTitle: "Create Category",
    nomeCategoriaLabel: "Category Name",
    nomeCategoriaPlaceholder: "E.g. Gym, Gifts...",
    scegliIconaLabel: "Choose Icon",
    scegliColoreLabel: "Choose Color",
    annullaBtn: "Cancel",
    creaBtn: "Create",
    assistenteFinanziario: "Financial Assistant",
    analizzaDati: "Analyzes your data in real time",
    chatWelcome: "👋 Hi! Ask me anything about your budget.",
    chatExample: 'E.g: "How much did I spend 3 days ago?", "What was my biggest expense this month?"',
    chatPlaceholder: "Ask the AI...",
    inviaBtn: "Send",
    analizzando: "Analyzing your data...",
    tuttiMovimenti: "All transactions",
    settimanaDelPrefix: "Week of",
    lingua: "Language",
    installTitle: "Install the app",
    installDesc: "Add it to your Home Screen to use it full-screen, like a real app.",
    installIosSteps: 'Look for the "Share" icon (a square with an upward arrow ⬆️) in your browser, tap it, then choose "Add to Home Screen". On iPhone/iPad it\'s usually in the top or bottom bar depending on the browser.',
    installAndroidSteps: 'Tap the browser menu (⋮ top right) and choose "Add to Home Screen" or "Install app".',
    installBtn: "Install",
    installDismiss: "Not now",
    backupBtn: "Data backup",
    esportaBtn: "Export backup",
    importaBtn: "Import backup",
    backupDesc: "Export a backup file before installing the app or switching device, then import it to recover your data.",
    importSuccess: "Data imported successfully!",
    importError: "Invalid or corrupted file. Try again with a backup exported from this app.",
    modificaCategoriaTitle: "Edit Category",
    eliminaCategoriaBtn: "Delete Category",
    confermaEliminaCatTitle: "Delete Category",
    generatedIn: "Response generated in",
    with: "with",
    confermaEliminaCatMsg: (count: number, label: string) =>
      count > 0
        ? `Are you sure you want to delete the category "${label}"? There are ${count} associated ${count === 1 ? "transaction that will be moved" : "transactions that will be moved"} to the "Other" category.`
        : `Are you sure you want to delete the category "${label}"?`,
    nonEliminabile: "Default category cannot be deleted",
    elaborando: "The assistant is processing the response...",
    tickerLabel: "Ticker (optional)",
    tickerPlaceholder: "E.g. AAPL, VWCE.MI",
    tickerHint: "If set, tracks the % change versus today's price.",
    tickerNotFound: "Ticker not found or quote unavailable. Check the symbol or leave the field empty.",
    savingTicker: "Checking ticker...",
    refreshingQuotes: "Refreshing quotes...",
    aggiornaQuotazioniBtn: "Refresh quotes",
  },
  pl: {
    patrimonioTotale: "Całkowity majątek",
    liquidita: "Płynność",
    investitiLabel: "Zainwestowane",
    tabSpese: "Wydatki",
    tabEntrate: "Przychody",
    tabInvest: "Inwest.",
    periodGiorno: "Dzień",
    periodSettimana: "Tydzień",
    periodMese: "Miesiąc",
    periodAnno: "Rok",
    periodTutti: "Wszystkie",
    confrontoPeriodo: "Porównanie okresu",
    nessunMovimento: "Brak transakcji w tym okresie.",
    modifica: "Edytuj",
    modificaMovimento: "Edytuj transakcję",
    nuovaUscita: "Nowy wydatek",
    nuovaEntrata: "Nowy przychód",
    nuovoInvestimento: "Nowa inwestycja",
    importoLabel: "Kwota (€)",
    dataLabel: "Data",
    descrizioneLabel: "Opis / Notatki",
    descrizionePlaceholder: "Np. Zakupy, ETF...",
    selezionaCategoria: "Wybierz kategorię",
    nuovaCategoriaBtn: "+ Nowa kategoria",
    eliminaBtn: "Usuń",
    salvaBtn: "Zapisz",
    aggiornaBtn: "Aktualizuj",
    creaCategoriaTitle: "Utwórz kategorię",
    nomeCategoriaLabel: "Nazwa kategorii",
    nomeCategoriaPlaceholder: "Np. Siłownia, Prezenty...",
    scegliIconaLabel: "Wybierz ikonę",
    scegliColoreLabel: "Wybierz kolor",
    annullaBtn: "Anuluj",
    creaBtn: "Utwórz",
    assistenteFinanziario: "Asystent finansowy",
    analizzaDati: "Analizuje Twoje dane w czasie rzeczywistym",
    chatWelcome: "👋 Cześć! Zapytaj mnie o cokolwiek związanego z Twoim budżetem.",
    chatExample: 'Np.: "Ile wydałem 3 dni temu?", "Jaki był mój największy wydatek w tym miesiącu?"',
    chatPlaceholder: "Zapytaj AI...",
    inviaBtn: "Wyślij",
    analizzando: "Analizuję Twoje dane...",
    tuttiMovimenti: "Wszystkie transakcje",
    settimanaDelPrefix: "Tydzień od",
    lingua: "Język",
    installTitle: "Zainstaluj aplikację",
    installDesc: "Dodaj ją do ekranu głównego, aby korzystać z niej na pełnym ekranie, jak z prawdziwej aplikacji.",
    installIosSteps: 'Znajdź ikonę "Udostępnij" (kwadrat ze strzałką w górę ⬆️) w swojej przeglądarce, dotknij jej, a następnie wybierz "Dodaj do ekranu początkowego". Na iPhonie/iPadzie zwykle znajduje się na górnym lub dolnym pasku, w zależności od przeglądarki.',
    installAndroidSteps: 'Dotknij menu przeglądarki (⋮ w prawym górnym rogu) i wybierz "Dodaj do ekranu głównego" lub "Zainstaluj aplikację".',
    installBtn: "Zainstaluj",
    installDismiss: "Nie teraz",
    backupBtn: "Kopia zapasowa",
    esportaBtn: "Eksportuj kopię",
    importaBtn: "Importuj kopię",
    backupDesc: "Wyeksportuj plik kopii zapasowej przed instalacją aplikacji lub zmianą urządzenia, a następnie zaimportuj go, aby odzyskać dane.",
    importSuccess: "Dane zaimportowane pomyślnie!",
    importError: "Nieprawidłowy lub uszkodzony plik. Spróbuj ponownie z kopią zapasową wyeksportowaną z tej aplikacji.",
    modificaCategoriaTitle: "Edytuj kategorię",
    eliminaCategoriaBtn: "Usuń kategorię",
    confermaEliminaCatTitle: "Usuń kategorię",
    confermaEliminaCatMsg: (count: number, label: string) =>
      count > 0
        ? `Czy na pewno chcesz usunąć kategorię „${label}”? Liczba powiązanych transakcji: ${count} – zostaną przeniesione do kategorii „Inne”.`
        : `Czy na pewno chcesz usunąć kategorię „${label}”?`,
    nonEliminabile: "Domyślna kategoria (nie można usunąć)",
    generatedIn: "Odpowiedź wygenerowana w", 
    with: "z",
    elaborando: "Asystent przetwarza odpowiedź...",
    tickerLabel: "Ticker (opcjonalnie)",
    tickerPlaceholder: "Np. AAPL, VWCE.MI",
    tickerHint: "Jeśli podasz ticker, śledzimy zmianę % względem dzisiejszej ceny.",
    tickerNotFound: "Nie znaleziono tickera lub brak notowania. Sprawdź symbol albo zostaw pole puste.",
    savingTicker: "Sprawdzam ticker...",
    refreshingQuotes: "Aktualizuję notowania...",
    aggiornaQuotazioniBtn: "Odśwież notowania",
  },
};



const ensureAltroCategory = (cats: any) => {
  if (!cats || typeof cats !== "object") return DEFAULT_CATEGORIES;
  const result: any = { ...cats };
  const types = ["spese", "entrate", "investimenti"] as const;
  types.forEach((type) => {
    const list = Array.isArray(result[type]) ? [...result[type]] : [];
    if (!list.some((c: any) => c.id === "altro")) {
      list.push({
        id: "altro",
        label: "Altro",
        icon: "📁",
        color: "#64748b",
      });
    }
    result[type] = list;
  });
  return result;
};

const getColorHex = (colorStr: string) => {
  if (!colorStr) return "#9ca3af";
  if (colorStr.startsWith("#")) return colorStr;
  if (colorStr.includes("red")) return "#ef4444";
  if (colorStr.includes("green")) return "#22c55e";
  if (colorStr.includes("blue")) return "#3b82f6";
  if (colorStr.includes("purple")) return "#a855f7";
  if (colorStr.includes("yellow") || colorStr.includes("amber")) return "#eab308";
  if (colorStr.includes("orange")) return "#f97316";
  if (colorStr.includes("teal")) return "#06b6d4";
  if (colorStr.includes("pink")) return "#ec4899";
  return "#64748b";
};

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("spese");
  const [timeFrame, setTimeFrame] = useState("giorno");
  const [viewDate, setViewDate] = useState(new Date());
  
  const currentModelName = "Dots 3 Note";


  // Stato Lingua
  const [lang, setLang] = useState<Lang>("it");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];
  const currentT = TRANSLATIONS[lang] || TRANSLATIONS.it;

  
  
  // Stato Banner Installazione PWA
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Stato Pannello Backup (Esporta/Importa dati)
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const tabLabel = (tabId: string) => {
    if (tabId === "spese") return t.tabSpese;
    if (tabId === "entrate") return t.tabEntrate;
    return t.tabInvest;
  };

  // Stato Modale Transazione
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Stato Modale Categoria (Crea o Modifica)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("🏷️");
  const [catColor, setCatColor] = useState("#a855f7");

  // Stato Modale Conferma Eliminazione Categoria
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<any | null>(null);

  // Stato Modale Chat AI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");

  const [tickerInput, setTickerInput] = useState("");
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [isSavingTicker, setIsSavingTicker] = useState(false);

  const [quotes, setQuotes] = useState<Record<string, { price: number; currency: string }>>({});
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);

  // Vercel AI SDK Hook (transport + body dinamico, include la lingua per l'assistente)
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ transactions, language: lang }),
    }),
    onToolCall({ toolCall }) {
    if (toolCall.toolName === 'addTransaction') {
      const args = toolCall.input as { type: string; amount: number; description: string; categoryId?: string };
      const targetCategories = (categories as any)[args.type] || [];
      const catId = args.categoryId && targetCategories.some((c: any) => c.id === args.categoryId)
        ? args.categoryId
        : targetCategories[0]?.id || 'altro';

      const newTx = {
        id: Date.now(),
        amount: Number(args.amount),
        type: args.type,
        categoryId: catId,
        description: args.description || '',
        date: new Date().toISOString().split('T')[0],
      };

      setTransactions((prev) => [newTx, ...prev]);
    }
  },

  });



  const isLoading = status === "submitted" || status === "streaming";

  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      if (!startTimeRef.current) {
        startTimeRef.current = performance.now();
        setResponseTime(null);
      }
    } else if (status === "ready" && startTimeRef.current) {
      const duration = (performance.now() - startTimeRef.current) / 1000;
      setResponseTime(Number(duration.toFixed(2)));
      startTimeRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    const savedTx = localStorage.getItem("budget-dati-v7");
    const savedCat = localStorage.getItem("budget-cat-v7");
    const savedLang = localStorage.getItem("budget-lang-v7");
    if (savedTx) { try { setTransactions(JSON.parse(savedTx)); } catch (e) {} }
    if (savedCat) {
      try {
        const parsed = JSON.parse(savedCat);
        setCategories(ensureAltroCategory(parsed));
      } catch (e) {
        setCategories(ensureAltroCategory(DEFAULT_CATEGORIES));
      }
    } else {
      setCategories(ensureAltroCategory(DEFAULT_CATEGORIES));
    }
    if (savedLang && ["it", "en", "pl"].includes(savedLang)) { setLang(savedLang as Lang); }
    setMounted(true);

    // Rileva se l'app è già installata (aperta come PWA standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIos(isIosDevice);

    // Il banner compare ad ogni apertura finché l'app non è effettivamente
    // installata: chiuderlo con "Non ora" lo nasconde solo per questa sessione.
    if (!isStandalone && isMobileDevice) {
      setShowInstallBanner(true);
    }

    // Registra il Service Worker: necessario perché Chrome/Android consideri
    // l'app "installabile" e attivi l'evento beforeinstallprompt qui sotto.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Su Android/Chrome intercetta l'evento per mostrare un vero pulsante "Installa"
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const dismissInstallBanner = () => {
    // Nascosto solo per la sessione corrente: ricompare alla prossima apertura
    // dell'app, a meno che nel frattempo non venga effettivamente installata.
    setShowInstallBanner(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismissInstallBanner();
      }
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("budget-dati-v7", JSON.stringify(transactions));
      localStorage.setItem("budget-cat-v7", JSON.stringify(categories));
      localStorage.setItem("budget-lang-v7", lang);
    }
  }, [transactions, categories, lang, mounted]);

  // Riporta la vista a "oggi/giorno" solo se l'app è rimasta in background
  // per più di 30 minuti (es. lasciata aperta da ieri sul telefono).
  // Se cambi app solo per un attimo (rispondere a un messaggio, ecc.)
  // la navigazione tra i mesi/giorni non viene toccata.
  const lastHiddenAtRef = useRef<number | null>(null);
  useEffect(() => {
    const RESET_THRESHOLD_MS = 30 * 60 * 1000; // 30 minuti

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAtRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        const hiddenAt = lastHiddenAtRef.current;
        if (hiddenAt && Date.now() - hiddenAt > RESET_THRESHOLD_MS) {
          setViewDate(new Date());
          setTimeFrame("giorno");
        }
        lastHiddenAtRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Chiude i menu lingua/backup quando si tocca un punto qualsiasi fuori da essi.
  const langMenuRef = useRef<HTMLDivElement>(null);
  const backupMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isLangMenuOpen && !isBackupMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (isLangMenuOpen && langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (isBackupMenuOpen && backupMenuRef.current && !backupMenuRef.current.contains(target)) {
        setIsBackupMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLangMenuOpen, isBackupMenuOpen]);

    useEffect(() => {
    if (mounted) refreshQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (mounted && activeTab === "investimenti") {
      refreshQuotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Altezza minima dell'app: su iPhone/iPad in modalità app installata, 100vh può
  // risultare più corto dello schermo reale, lasciando una fascia scura in basso.
  // Qui prendiamo il valore più alto tra viewport e schermo (solo iOS, in verticale).
  useEffect(() => {
    const updateAppHeight = () => {
      const ua = window.navigator.userAgent;
      const isIosDevice = /iphone|ipad|ipod/i.test(ua);
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const screenH = isIosDevice && isStandalone && isPortrait ? window.screen.height : 0;
      const h = Math.max(window.innerHeight, screenH);
      document.documentElement.style.setProperty("--app-min-h", `${h}px`);
    };
    updateAppHeight();
    window.addEventListener("resize", updateAppHeight);
    window.addEventListener("orientationchange", updateAppHeight);
    return () => {
      window.removeEventListener("resize", updateAppHeight);
      window.removeEventListener("orientationchange", updateAppHeight);
    };
  }, []);

    const fetchQuote = async (symbol: string, date?: string): Promise<{ price: number; currency: string } | null> => {
    try {
      const url = date
        ? `/api/quote?symbol=${encodeURIComponent(symbol)}&date=${encodeURIComponent(date)}`
        : `/api/quote?symbol=${encodeURIComponent(symbol)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || data.error || typeof data.regularMarketPrice !== "number") return null;
      return { price: data.regularMarketPrice, currency: data.currency || "USD" };
    } catch {
      return null;
    }
  };

  const refreshQuotes = async () => {
    const tickers = Array.from(
      new Set(
        transactions
          .filter((tx) => tx.type === "investimenti" && tx.ticker)
          .map((tx) => tx.ticker as string)
      )
    );
    if (tickers.length === 0) return;

    setIsRefreshingQuotes(true);
    const results = await Promise.all(tickers.map((sym) => fetchQuote(sym)));
    setQuotes((prev) => {
      const next = { ...prev };
      tickers.forEach((sym, i) => {
        if (results[i]) next[sym] = results[i]!;
      });
      return next;
    });
    setIsRefreshingQuotes(false);
  };

  const openNewModal = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTickerInput("");
    setTickerError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setDescription(t.description || "");
    setDate(t.date);
    const cat = getCategoryData(t.type, t.categoryId);
    setSelectedCategory(cat);
    setActiveTab(t.type);
    setTickerInput(t.ticker || "");
    setTickerError(null);
    setIsModalOpen(true);
  };

  const saveTransaction = async (e: any) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;

    const trimmedTicker = tickerInput.trim().toUpperCase();
    const existingTx = editingId ? transactions.find((tx) => tx.id === editingId) : null;
    const tickerChanged = trimmedTicker !== ((existingTx?.ticker as string) || "");

    let ticker: string | undefined = existingTx?.ticker;
    let priceAtPurchase: number | undefined = existingTx?.priceAtPurchase;

    if (activeTab === "investimenti" && trimmedTicker) {
      if (!existingTx || tickerChanged) {
        setIsSavingTicker(true);
        setTickerError(null);
        const quote = await fetchQuote(trimmedTicker, date);
        setIsSavingTicker(false);
        if (!quote) {
          setTickerError(t.tickerNotFound);
          return;
        }
        ticker = trimmedTicker;
        priceAtPurchase = quote.price;
        setQuotes((prev) => ({ ...prev, [trimmedTicker]: quote }));
      }
    } else {
      ticker = undefined;
      priceAtPurchase = undefined;
    }

    if (editingId) {
      setTransactions(transactions.map(tx => tx.id === editingId ? {
        ...tx,
        amount: parseFloat(amount),
        type: activeTab,
        categoryId: selectedCategory.id,
        description: description.trim(),
        date: date,
        ticker,
        priceAtPurchase,
      } : tx));
    } else {
      const newTx = {
        id: Date.now(),
        amount: parseFloat(amount),
        type: activeTab,
        categoryId: selectedCategory.id,
        description: description.trim(),
        date: date,
        ticker,
        priceAtPurchase,
      };
      setTransactions([newTx, ...transactions]);
    }

    setIsModalOpen(false);
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
    setIsModalOpen(false);
  };

  const openNewCategoryModal = () => {
    setEditingCat(null);
    setCatName("");
    setCatIcon("🏷️");
    setCatColor("#a855f7");
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    const currentLabel = getCategoryLabel(cat);
    setEditingCat(cat);
    setCatName(currentLabel);
    setCatIcon(cat.icon || "🏷️");
    setCatColor(getColorHex(cat.color));
    setIsCatModalOpen(true);
  };

  const saveCategory = (e: any) => {
    e.preventDefault();
    const trimmed = catName.trim();
    if (!trimmed) return;

    const currentList = (categories as any)[activeTab] || [];

    if (editingCat) {
      const updatedList = currentList.map((c: any) => {
        if (c.id === editingCat.id) {
          return {
            ...c,
            label: trimmed,
            icon: catIcon || "🏷️",
            color: catColor,
            isEdited: true,
          };
        }
        return c;
      });

      setCategories({
        ...categories,
        [activeTab]: updatedList,
      });

      if (selectedCategory?.id === editingCat.id) {
        setSelectedCategory({
          ...editingCat,
          label: trimmed,
          icon: catIcon || "🏷️",
          color: catColor,
          isEdited: true,
        });
      }
    } else {
      const newCat = {
        id: `custom-${Date.now()}`,
        label: trimmed,
        icon: catIcon || "🏷️",
        color: catColor,
        isEdited: true,
      };

      setCategories({
        ...categories,
        [activeTab]: [...currentList, newCat],
      });

      setSelectedCategory(newCat);
    }

    setIsCatModalOpen(false);
    setEditingCat(null);
  };

  const requestDeleteCategory = (cat: any) => {
    if (cat.id === "altro") return;
    setCatToDelete(cat);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (!catToDelete || catToDelete.id === "altro") return;
    const catId = catToDelete.id;
    const targetId = "altro";

    // 1. Sposta le transazioni della categoria su "altro"
    const updatedTx = transactions.map((tx) => {
      if (tx.type === activeTab && tx.categoryId === catId) {
        return { ...tx, categoryId: targetId };
      }
      return tx;
    });
    setTransactions(updatedTx);

    // 2. Rimuovi la categoria da categories
    const currentList = (categories as any)[activeTab] || [];
    const updatedList = currentList.filter((c: any) => c.id !== catId);
    setCategories({
      ...categories,
      [activeTab]: updatedList,
    });

    // 3. Se era selezionata nella modale transazione, aggiorna a "altro"
    if (selectedCategory?.id === catId) {
      const altroCat = updatedList.find((c: any) => c.id === targetId);
      if (altroCat) {
        setSelectedCategory({
          ...altroCat,
          label: getCategoryLabel(altroCat),
          color: getColorHex(altroCat.color),
        });
      } else {
        setSelectedCategory(null);
      }
    }

    setIsDeleteConfirmOpen(false);
    setCatToDelete(null);
    setIsCatModalOpen(false);
    setEditingCat(null);
  };

  const exportData = () => {
    const backup = {
      transactions,
      categories,
      lang,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    a.download = `budget-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed.transactions) || typeof parsed.categories !== "object") {
          throw new Error("Formato non valido");
        }
        setTransactions(parsed.transactions);
        setCategories(ensureAltroCategory(parsed.categories));
        if (parsed.lang && ["it", "en", "pl"].includes(parsed.lang)) {
          setLang(parsed.lang as Lang);
        }
        setImportMessage({ type: "ok", text: t.importSuccess });
      } catch (err) {
        setImportMessage({ type: "error", text: t.importError });
      }
      setTimeout(() => setImportMessage(null), 4000);
    };
    reader.readAsText(file);
    setIsBackupMenuOpen(false);
    e.target.value = ""; // permette di reimportare lo stesso file più volte
  };

  const navigatePeriod = (direction: number) => {

    const newDate = new Date(viewDate);
    if (timeFrame === "giorno") {
      newDate.setDate(newDate.getDate() + direction);
    } else if (timeFrame === "settimana") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (timeFrame === "mese") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (timeFrame === "anno") {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    setViewDate(newDate);
  };

  // Restituisce l'etichetta della categoria: nome personalizzato se modificata o creata,
  // altrimenti traduzione per le categorie di default.
  const getCategoryLabel = (cat: any) => {
    if (!cat) return "";
    if (cat.isEdited) return cat.label;
    return CATEGORY_LABELS[lang]?.[cat.id] ?? cat.label;
  };

  const getCategoryData = (type: string, categoryId: string) => {
    const list = (categories as any)[type] || [];
    const cat = list.find((c: any) => c.id === categoryId);
    if (cat) {
      const label = getCategoryLabel(cat);
      return { ...cat, label, color: getColorHex(cat.color) };
    }
    if (categoryId === "altro") {
      const label = CATEGORY_LABELS[lang]?.["altro"] ?? "Altro";
      return { id: "altro", label, icon: "📁", color: "#64748b" };
    }
    return { id: categoryId, label: categoryId, icon: "❓", color: "#64748b" };
  };

  if (!mounted) return null;

  const filteredByPeriod = sortedTransactions.filter(tx => {
    if (!tx.date) return true;
    const tDate = new Date(tx.date);

    if (timeFrame === "giorno") {
      return tDate.toDateString() === viewDate.toDateString();
    }
    if (timeFrame === "settimana") {
      const diffTime = Math.abs(viewDate.getTime() - tDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
    }
    if (timeFrame === "mese") {
      return tDate.getMonth() === viewDate.getMonth() && tDate.getFullYear() === viewDate.getFullYear();
    }
    if (timeFrame === "anno") {
      return tDate.getFullYear() === viewDate.getFullYear();
    }
    return true;
  });

  
  const trackedPeriodInvestments = filteredByPeriod.filter(
    (tx) => tx.type === "investimenti" && tx.ticker && tx.priceAtPurchase && quotes[tx.ticker]
  );
  const periodCostBasis = trackedPeriodInvestments.reduce((a, tx) => a + tx.amount, 0);
  const periodCurrentValue = trackedPeriodInvestments.reduce(
    (a, tx) => a + tx.amount * (quotes[tx.ticker as string].price / (tx.priceAtPurchase as number)),
    0
  );
  const periodGainAbs = periodCurrentValue - periodCostBasis;
  const periodGainPct = periodCostBasis > 0 ? (periodCurrentValue / periodCostBasis - 1) * 100 : null;
  const filteredTransactions = filteredByPeriod.filter(tx => tx.type === activeTab);
  const totaleTabAttiva = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const periodEntrate = filteredByPeriod.filter(tx => tx.type === "entrate").reduce((a, b) => a + b.amount, 0);
  const periodSpese = filteredByPeriod.filter(tx => tx.type === "spese").reduce((a, b) => a + b.amount, 0);
  const periodInvestiti = filteredByPeriod.filter(tx => tx.type === "investimenti").reduce((a, b) => a + b.amount, 0);
  const periodTotalSum = periodEntrate + periodSpese + periodInvestiti;

  const totaleEntrate = transactions.filter(tx => tx.type === "entrate").reduce((a, b) => a + b.amount, 0);
  const totaleSpese = transactions.filter(tx => tx.type === "spese").reduce((a, b) => a + b.amount, 0);
  const totaleInvestiti = transactions.filter(tx => tx.type === "investimenti").reduce((a, b) => a + b.amount, 0);

  const liquidita = totaleEntrate - totaleSpese - totaleInvestiti;
  const patrimonioTotale = liquidita + totaleInvestiti;

  const categoryTotals = filteredTransactions.reduce((acc: any, tx) => {
    acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
    return acc;
  }, {});

  let cumulativePercent = 0;
  const chartSlices: string[] = [];
  const categoryBreakdown: any[] = [];

  if (totaleTabAttiva > 0) {
    Object.entries(categoryTotals).forEach(([catId, amt]: [string, any]) => {
      const catData = getCategoryData(activeTab, catId);
      const percent = (amt / totaleTabAttiva) * 100;
      const start = cumulativePercent;
      const end = cumulativePercent + percent;
      cumulativePercent = end;

      chartSlices.push(`${catData.color} ${start}% ${end}%`);
      categoryBreakdown.push({ ...catData, amount: amt, percent });
    });
  }

  const conicGradientBg = chartSlices.length > 0 
    ? `conic-gradient(${chartSlices.join(", ")})` 
    : "#374151";

  const getPeriodLabel = () => {
    const locale = DATE_LOCALE[lang];
    if (timeFrame === "giorno") return viewDate.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    if (timeFrame === "mese") return viewDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
    if (timeFrame === "anno") return viewDate.getFullYear().toString();
    if (timeFrame === "settimana") return `${t.settimanaDelPrefix} ${viewDate.getDate()}/${viewDate.getMonth() + 1}`;
    return t.tuttiMovimenti;
  };

  return (
  <main
    className="w-full max-w-md mx-auto bg-[#2d2d2d] text-white font-sans flex flex-col relative h-[100dvh] overflow-hidden"
  >
      
      {/* HEADER */}
      <header className="bg-[#1f3b2d] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-2 px-4 flex flex-col items-center shadow-md z-10 relative rounded-b-3xl">

        {/* SELETTORE LINGUA + BACKUP */}
        <div className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] right-3 z-20 flex items-center gap-2">
          <div className="relative" ref={backupMenuRef}>
            <button
              onClick={() => setIsBackupMenuOpen(!isBackupMenuOpen)}
              className="flex items-center gap-1 bg-[#162a20] border border-green-900/40 rounded-full px-2.5 py-1 text-base"
            >
              <span>💾</span>
            </button>
            {isBackupMenuOpen && (
              <div className="absolute top-9 right-0 bg-[#162a20] border border-green-900/40 rounded-xl overflow-hidden shadow-xl w-56 p-3">
                <p className="text-xs text-gray-400 mb-3">{t.backupDesc}</p>
                <button
                  onClick={exportData}
                  className="w-full bg-[#4caf50] text-white text-sm font-bold px-3 py-2 rounded-lg mb-2"
                >
                  {t.esportaBtn}
                </button>
                <label className="w-full block bg-[#1f3b2d] text-white text-sm font-bold px-3 py-2 rounded-lg text-center cursor-pointer">
                  {t.importaBtn}
                  <input type="file" accept="application/json" onChange={importData} className="hidden" />
                </label>
              </div>
            )}
          </div>
          <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 bg-[#162a20] border border-green-900/40 rounded-full px-2.5 py-1 text-base"
          >
            <span>{LANGUAGE_META[lang].flag}</span>
          </button>
          {isLangMenuOpen && (
            <div className="absolute top-9 right-0 bg-[#162a20] border border-green-900/40 rounded-xl overflow-hidden shadow-xl min-w-[130px]">
              {(Object.keys(LANGUAGE_META) as Lang[]).map((code) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setIsLangMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-base text-left hover:bg-[#1f3b2d] transition-colors ${
                    lang === code ? "bg-[#1f3b2d] font-bold" : ""
                  }`}
                >
                  <span>{LANGUAGE_META[code].flag}</span>
                  <span>{LANGUAGE_META[code].name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-sm text-gray-300 uppercase tracking-wider">{t.patrimonioTotale}</p>
          <h1 className="text-3xl font-bold">{patrimonioTotale.toFixed(2)} €</h1>
        </div>

        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 w-full text-sm text-gray-300 bg-[#162a20] p-2 rounded-xl mb-3 border border-green-900/40">
          <span>💧 {t.liquidita}: <strong className="text-white">{liquidita.toFixed(2)} €</strong></span>
          <span>📈 {t.investitiLabel}: <strong className="text-blue-400">{totaleInvestiti.toFixed(2)} €</strong></span>
        </div>

        {/* TAB NAV */}
        <div className="flex w-full text-base font-semibold text-gray-400">
          {["spese", "entrate", "investimenti"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2 border-b-2 uppercase tracking-wide transition-colors ${
                activeTab === tab ? "border-[#4caf50] text-white" : "border-transparent"
              }`}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
      </header>

      {/* AREA CENTRALE */}
      <div className="flex-1 bg-[#2d2d2d] mt-2 rounded-t-3xl p-4 flex flex-col overflow-y-auto pb-24">
        
        {/* SELETTORE PERIODO */}
        <div className="flex justify-between text-sm text-gray-400 mb-3 px-1 bg-[#1e1e1e] p-1.5 rounded-xl">
          {[
            { id: "giorno", label: t.periodGiorno },
            { id: "settimana", label: t.periodSettimana },
            { id: "mese", label: t.periodMese },
            { id: "anno", label: t.periodAnno },
            { id: "tutti", label: t.periodTutti },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFrame(item.id)}
              className={`px-2 py-1 rounded-lg transition-all ${
                timeFrame === item.id ? "bg-[#4caf50] text-white font-bold" : "hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === "investimenti" && (
          <button
            onClick={refreshQuotes}
            disabled={isRefreshingQuotes}
            className="self-end text-xs text-gray-400 mb-3 flex items-center gap-1 disabled:opacity-50"
          >
            <span className={isRefreshingQuotes ? "animate-spin" : ""}>🔄</span>
            {isRefreshingQuotes ? t.refreshingQuotes : t.aggiornaQuotazioniBtn}
          </button>
        )}

        {/* NAVIGAZIONE DATA */}
        {timeFrame !== "tutti" && (
          <div className="flex justify-between items-center bg-[#1e1e1e]/60 px-4 py-2 rounded-xl mb-4 text-base font-medium relative">
            <button onClick={() => navigatePeriod(-1)} className="p-1 hover:text-[#4caf50] text-lg font-bold">❮</button>
            <div className="relative flex items-center gap-2 cursor-pointer">
              <span className="capitalize text-gray-200">{getPeriodLabel()}</span>
              <input 
                type={timeFrame === "mese" ? "month" : "date"}
                value={viewDate.toISOString().split("T")[0].substring(0, timeFrame === "mese" ? 7 : 10)}
                onChange={(e) => {
                  if (e.target.value) setViewDate(new Date(e.target.value));
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="text-sm bg-[#2d2d2d] p-1 rounded-md text-gray-400">📅</span>
            </div>
            <button onClick={() => navigatePeriod(1)} className="p-1 hover:text-[#4caf50] text-lg font-bold">❯</button>
          </div>
        )}

        {/* CONFRONTO MACRO-CATEGORIE */}
        <div className="bg-[#1e1e1e] p-3.5 rounded-2xl mb-5 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">
            {t.confrontoPeriodo} ({getPeriodLabel()})
          </p>

          <div className="w-full h-3 bg-gray-700 rounded-full flex overflow-hidden mb-3">
            {periodTotalSum > 0 ? (
              <>
                <div style={{ width: `${(periodEntrate / periodTotalSum) * 100}%` }} className="bg-[#10b981] h-full transition-all" />
                <div style={{ width: `${(periodSpese / periodTotalSum) * 100}%` }} className="bg-[#ef4444] h-full transition-all" />
                <div style={{ width: `${(periodInvestiti / periodTotalSum) * 100}%` }} className="bg-[#3b82f6] h-full transition-all" />
              </>
            ) : (
              <div className="w-full h-full bg-gray-600" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#10b981]">
              <span className="text-gray-400 text-xs block">{t.tabEntrate}</span>
              <strong className="text-[#10b981]">{periodEntrate.toFixed(2)} €</strong>
            </div>
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#ef4444]">
              <span className="text-gray-400 text-xs block">{t.tabSpese}</span>
              <strong className="text-[#ef4444]">{periodSpese.toFixed(2)} €</strong>
            </div>
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#3b82f6]">
              <span className="text-gray-400 text-xs block">{t.tabInvest}</span>
              <strong className="text-[#3b82f6]">{periodInvestiti.toFixed(2)} €</strong>
              {periodGainPct !== null && (
                <p className={`text-xs font-bold mt-0.5 ${periodGainAbs >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {periodGainAbs >= 0 ? "▲" : "▼"} {periodGainAbs >= 0 ? "+" : ""}{periodGainAbs.toFixed(2)} € ({periodGainPct >= 0 ? "+" : ""}{periodGainPct.toFixed(1)}%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* GRAFICO A CIAMBELLA */}
        <div className="relative w-44 h-44 mx-auto mb-4 flex items-center justify-center p-3">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center shadow-xl transition-all duration-500 p-3"
            style={{ background: conicGradientBg }}
          >
            <div className="w-full h-full bg-[#2d2d2d] rounded-full flex items-center justify-center text-center shadow-inner">
              <div>
                <span className="text-xl font-bold">{totaleTabAttiva.toFixed(2)} €</span>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{tabLabel(activeTab)}</p>
                {activeTab === "investimenti" && periodGainPct !== null && (
                  <p className={`text-xs font-bold mt-1 ${periodGainAbs >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                    {periodGainAbs >= 0 ? "▲" : "▼"} {periodGainPct >= 0 ? "+" : ""}{periodGainPct.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LEGENDA CATEGORIE */}
        {categoryBreakdown.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categoryBreakdown.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5 bg-[#1e1e1e] px-2.5 py-1 rounded-full text-sm">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-300">{cat.label}:</span>
                <strong className="text-white">{cat.percent.toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        )}

        {/* LISTA TRANSAZIONI */}
        <div className="flex flex-col gap-2">
          {filteredTransactions.map((tx) => {
            const catData = getCategoryData(tx.type, tx.categoryId);
            const currentQuote = tx.ticker ? quotes[tx.ticker] : null;
            const rawChangePct =
                   currentQuote && tx.priceAtPurchase
                    ? ((currentQuote.price / tx.priceAtPurchase) - 1) * 100
                    : null;

            const changePct =
               rawChangePct !== null && Math.abs(rawChangePct) < 0.05
                ? 0
                : rawChangePct;

            return (
              <div 
                key={tx.id} 
                onClick={() => openEditModal(tx)}
                className="bg-[#3a3a3a] p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#444444] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner"
                    style={{ backgroundColor: catData.color }}
                  >
                    {catData.icon}
                  </div>
                  <div>
                    <p className="font-medium text-base text-gray-100">{catData.label}</p>
                    {tx.description && <p className="text-sm text-gray-400">{tx.description}</p>}
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-gray-500">{tx.date}</p>
                      {tx.ticker && (
                        <span className="text-xs text-gray-500 bg-[#2d2d2d] px-1.5 rounded">{tx.ticker}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-base ${tx.type === "spese" ? "text-white" : tx.type === "entrate" ? "text-[#10b981]" : "text-[#3b82f6]"}`}>
                    {tx.amount.toFixed(2)} €
                  </span>
                  {changePct !== null ? (
                    <p className={`text-xs font-bold ${changePct >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                      {changePct > 0 ? "▲" : changePct < 0 ? "▼" : "─"} {Math.abs(changePct).toFixed(2)}%
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">{t.modifica}</p>
                  )}
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <p className="text-center text-gray-500 mt-6 text-base">{t.nessunMovimento}</p>
          )}
        </div>
      </div>

      {/* ESITO IMPORT BACKUP */}
      {importMessage && (
        <div
          className={`fixed top-[calc(1rem+env(safe-area-inset-top))] left-4 right-4 z-50 rounded-xl px-4 py-3 text-base font-medium shadow-2xl ${
            importMessage.type === "ok" ? "bg-[#4caf50] text-white" : "bg-red-600 text-white"
          }`}
        >
          {importMessage.text}
        </div>
      )}

      {/* BANNER INSTALLAZIONE PWA */}
      {showInstallBanner && (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 bg-[#1f3b2d] border border-green-900/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📲</span>
            <div className="flex-1">
              <p className="font-bold text-base text-white">{t.installTitle}</p>
              <p className="text-sm text-gray-300 mt-1">
                {isIos ? t.installIosSteps : deferredPrompt ? t.installDesc : t.installAndroidSteps}
              </p>
              <div className="flex gap-2 mt-3">
                {!isIos && deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-[#4caf50] text-white text-sm font-bold px-3 py-1.5 rounded-lg"
                  >
                    {t.installBtn}
                  </button>
                )}
                <button
                  onClick={dismissInstallBanner}
                  className="text-gray-400 text-sm px-3 py-1.5 rounded-lg hover:text-white"
                >
                  {t.installDismiss}
                </button>
              </div>
            </div>
            <button onClick={dismissInstallBanner} className="text-gray-500 text-lg leading-none">✕</button>
          </div>
        </div>
      )}

      {/* PULSANTE FLOTTANTE AGGIUNGI */}
      <button
        onClick={openNewModal}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-[#ffb74d] rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform z-20"
      >
        <IconPlus />
      </button>

      {/* PULSANTE FLOTTANTE CHATBOT AI */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-6 w-14 h-14 bg-[#3b82f6] rounded-full flex items-center justify-center text-white text-2xl shadow-xl hover:scale-105 transition-transform z-20"
      >
        💬
      </button>

      {/* MODALE CHATBOT AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-end">
          <div className="bg-[#2d2d2d] w-full sm:w-[95%] p-4 rounded-t-3xl h-[85vh] flex flex-col border-t border-gray-700">
            
            {/* HEADER CHAT */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-base">{t.assistenteFinanziario}</h3>
                  <p className="text-xs text-gray-400">{t.analizzaDati}</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 p-2 text-lg">✕</button>
            </div>

            {/* MESSAGGI CHAT */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 text-base">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm my-auto p-4 bg-[#1e1e1e] rounded-2xl">
                  {t.chatWelcome}<br/><br/>
                  <span className="italic text-gray-500">{t.chatExample}</span>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#4caf50] text-white self-end rounded-br-none"
                      : "bg-[#1e1e1e] text-gray-200 self-start rounded-bl-none border border-gray-700"
                  }`}
                >
                  {m.parts
                    ?.filter((p: any) => p.type === "text")
                    .map((p: any, idx: number) => (
                      <span key={`${m.id}-${idx}`}>{p.text}</span>
                    ))}
                </div>
              ))}

              {isLoading && (
                <div className="bg-[#1e1e1e] text-gray-400 p-3 rounded-2xl rounded-bl-none self-start text-sm border border-gray-700 animate-pulse">
                  {t.analizzando}
                </div>
              )}
            </div>
            {error && (
              <div className="mx-3 my-2 p-3 bg-red-900/60 border border-red-600 text-red-200 rounded-xl text-xs">
                <span className="font-bold">⚠ Errore di comunicazione:</span> {error.message}
              </div>
            )}
            {status === 'submitted' || status === 'streaming' ? (
              <div className="mx-3 my-1 text-gray-400 text-xs italic animate-pulse px-2">
               {currentT.elaborando}
              </div>
            ) : null}

            {responseTime !== null && status === "ready" && (
              <div className="text-center text-xs text-zinc-400 my-1">
                ⚡ {currentT.generatedIn} <span className="font-semibold text-zinc-200">{responseTime}s</span> {currentT.with} {currentModelName}
               </div>
            )}
            {/* INPUT E BOTTONE CHAT */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatText.trim() || isLoading) return;
                const textToSend = chatText;
                setChatText("");
                await sendMessage({ text: textToSend });
              }} 
              className="flex gap-2 pt-2 border-t border-gray-700"
            >
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-[#1e1e1e] border border-gray-700 p-3 rounded-xl text-white text-base outline-none focus:border-[#3b82f6]"
              />
              <button
                type="submit"
                disabled={isLoading || !chatText.trim()}
                className={`px-4 rounded-xl font-bold text-base transition-colors ${
                  isLoading || !chatText.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                    : "bg-[#3b82f6] hover:bg-blue-600 text-white"
                }`}
              >
                {t.inviaBtn}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MODALE INSERIMENTO / MODIFICA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-30 flex justify-center items-end">
          <div className="bg-[#2d2d2d] w-full sm:w-[95%] p-6 rounded-t-3xl h-[88vh] flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId
                  ? t.modificaMovimento
                  : activeTab === "spese" ? t.nuovaUscita : activeTab === "entrate" ? t.nuovaEntrata : t.nuovoInvestimento}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-2 text-xl">✕</button>
            </div>

            <form onSubmit={saveTransaction} className="flex flex-col gap-4 flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 uppercase mb-1 block">{t.importoLabel}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-xl w-full outline-none focus:border-[#4caf50]"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 uppercase mb-1 block">{t.dataLabel}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-base w-full outline-none focus:border-[#4caf50]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 uppercase mb-1 block">{t.descrizioneLabel}</label>
                <input
                  type="text"
                  placeholder={t.descrizionePlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-base w-full outline-none focus:border-[#4caf50]"
                />
              </div>

              {activeTab === "investimenti" && (
                <div>
                  <label className="text-sm text-gray-400 uppercase mb-1 block">{t.tickerLabel}</label>
                  <input
                    type="text"
                    placeholder={t.tickerPlaceholder}
                    value={tickerInput}
                    onChange={(e) => { setTickerInput(e.target.value); setTickerError(null); }}
                    className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-base w-full outline-none focus:border-[#4caf50] uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.tickerHint}</p>
                  {isSavingTicker && <p className="text-xs text-yellow-500 mt-1">{t.savingTicker}</p>}
                  {tickerError && <p className="text-xs text-red-500 mt-1">{tickerError}</p>}
                </div>
              )}

              {/* SELEZIONE CATEGORIA */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400 uppercase block">{t.selezionaCategoria}</label>
                  <button 
                    type="button" 
                    onClick={openNewCategoryModal}
                    className="text-sm text-[#4caf50] font-bold"
                  >
                    {t.nuovaCategoriaBtn}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {((categories as any)[activeTab] || []).map((cat: any) => {
                    const hexColor = getColorHex(cat.color);
                    const label = getCategoryLabel(cat);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory({ ...cat, label, color: hexColor })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 relative ${
                          selectedCategory?.id === cat.id ? "border-[#4caf50] bg-[#3a3a3a]" : "border-transparent bg-[#1e1e1e]"
                        }`}
                      >
                        {/* Bottone Modifica Categoria */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCategoryModal(cat);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/80 active:scale-90 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                          title={t.modificaCategoriaBtn || t.modifica}
                          aria-label={`${t.modifica} ${label}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>

                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1 shadow-md"
                          style={{ backgroundColor: hexColor }}
                        >
                          {cat.icon}
                        </div>
                        <span className="text-sm text-center text-gray-300 truncate max-w-[85px]">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TASTI AZIONE */}
              <div className="flex gap-2 mt-auto">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => deleteTransaction(editingId)}
                    className="flex-1 py-3.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold text-base"
                  >
                    {t.eliminaBtn}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!amount || !selectedCategory || isSavingTicker}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-base ${
                    !amount || !selectedCategory || isSavingTicker ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-[#4caf50] text-white"
                  }`}
                >
                  {isSavingTicker ? t.savingTicker : editingId ? t.aggiornaBtn : t.salvaBtn}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE CREAZIONE / MODIFICA CATEGORIA */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-[#2d2d2d] w-full max-w-xs p-5 rounded-2xl border border-gray-700 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">
                {editingCat ? t.modificaCategoriaTitle : t.creaCategoriaTitle} ({tabLabel(activeTab)})
              </h3>
              <button
                type="button"
                onClick={() => { setIsCatModalOpen(false); setEditingCat(null); }}
                className="text-gray-400 p-1 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveCategory} className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <div>
                <label className="text-sm text-gray-400 uppercase mb-1 block">{t.nomeCategoriaLabel}</label>
                <input 
                  type="text" 
                  placeholder={t.nomeCategoriaPlaceholder}
                  value={catName} 
                  onChange={e => setCatName(e.target.value)} 
                  className="bg-[#1e1e1e] border border-gray-700 p-2.5 rounded-xl text-white text-base w-full outline-none focus:border-[#4caf50]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 uppercase mb-2 block">{t.scegliIconaLabel}</label>
                <div className="grid grid-cols-6 gap-2 bg-[#1e1e1e] p-2 rounded-xl max-h-28 overflow-y-auto mb-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCatIcon(icon)}
                      className={`text-xl p-1 rounded-lg transition-all ${
                        catIcon === icon ? "bg-[#4caf50] scale-110" : "hover:bg-[#3a3a3a]"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 uppercase mb-2 block">{t.scegliColoreLabel}</label>
                <div className="grid grid-cols-6 gap-2 bg-[#1e1e1e] p-2 rounded-xl mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        catColor === color ? "ring-2 ring-white scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Se categoria "altro", avviso non eliminabile */}
              {editingCat?.id === "altro" && (
                <p className="text-xs text-gray-400 italic bg-[#1e1e1e] p-2 rounded-lg text-center">
                  🛡️ {t.nonEliminabile}
                </p>
              )}

              <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-700">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setIsCatModalOpen(false); setEditingCat(null); }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-xl text-base font-medium transition-colors"
                  >
                    {t.annullaBtn}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#4caf50] hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-base transition-colors"
                  >
                    {editingCat ? t.salvaBtn : t.creaBtn}
                  </button>
                </div>

                {/* Tasto elimina se categoria modificabile e diversa da "altro" */}
                {editingCat && editingCat.id !== "altro" && (
                  <button
                    type="button"
                    onClick={() => requestDeleteCategory(editingCat)}
                    className="w-full bg-red-600/80 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>{t.eliminaCategoriaBtn}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CONFERMA ELIMINAZIONE CATEGORIA */}
      {isDeleteConfirmOpen && catToDelete && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex justify-center items-center p-4">
          <div className="bg-[#2d2d2d] w-full max-w-xs p-5 rounded-2xl border border-red-900/60 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-white">{t.confermaEliminaCatTitle}</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t.confermaEliminaCatMsg(
                transactions.filter((tx) => tx.type === activeTab && tx.categoryId === catToDelete.id).length,
                getCategoryLabel(catToDelete)
              )}
            </p>
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {t.annullaBtn}
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                {t.eliminaBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}