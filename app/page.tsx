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
  "🐾", "💼", "💸", "📈", "₿", "👴", "🛠️", "🎬"
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
  ],
  entrate: [
    { id: "stipendio", label: "Stipendio", icon: "💼", color: "#10b981" },
    { id: "rimborsi", label: "Rimborsi", icon: "💸", color: "#06b6d4" },
    { id: "regali", label: "Regali", icon: "🎁", color: "#ec4899" },
  ],
  investimenti: [
    { id: "etf", label: "Azioni/ETF", icon: "📈", color: "#3b82f6" },
    { id: "crypto", label: "Crypto", icon: "₿", color: "#eab308" },
    { id: "fondo", label: "Fondo Pensione", icon: "👴", color: "#a855f7" },
  ]
};

// Traduzioni delle etichette delle categorie di default (id -> label per lingua).
// Le categorie create dall'utente mantengono invece il nome esatto digitato.
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  it: {
    alimentari: "Alimentari", bollette: "Bollette", uscite: "Uscite fuori",
    shopping: "Shopping", vacanza: "Vacanza", auto: "Auto/Trasporti",
    stipendio: "Stipendio", rimborsi: "Rimborsi", regali: "Regali",
    etf: "Azioni/ETF", crypto: "Crypto", fondo: "Fondo Pensione",
  },
  en: {
    alimentari: "Groceries", bollette: "Bills", uscite: "Dining Out",
    shopping: "Shopping", vacanza: "Vacation", auto: "Car/Transport",
    stipendio: "Salary", rimborsi: "Reimbursements", regali: "Gifts",
    etf: "Stocks/ETF", crypto: "Crypto", fondo: "Pension Fund",
  },
  pl: {
    alimentari: "Zakupy spożywcze", bollette: "Rachunki", uscite: "Jedzenie na mieście",
    shopping: "Zakupy", vacanza: "Wakacje", auto: "Samochód/Transport",
    stipendio: "Wynagrodzenie", rimborsi: "Zwroty", regali: "Prezenty",
    etf: "Akcje/ETF", crypto: "Krypto", fondo: "Fundusz emerytalny",
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
    installDesc: "Aggiungila alla schermata Home per usarla come un'app vera, a schermo intero.",
    installIosSteps: 'Tocca l\'icona di condivisione ⬆️ qui sotto, poi scegli "Aggiungi a Home".',
    installBtn: "Installa",
    installDismiss: "Non ora",
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
    installDesc: "Add it to your Home Screen to use it like a real full-screen app.",
    installIosSteps: 'Tap the share icon ⬆️ below, then choose "Add to Home Screen".',
    installBtn: "Install",
    installDismiss: "Not now",
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
    installDesc: "Dodaj ją do ekranu głównego, aby korzystać z niej jak z prawdziwej aplikacji na pełnym ekranie.",
    installIosSteps: 'Dotknij ikony udostępniania ⬆️ poniżej, a następnie wybierz "Dodaj do ekranu początkowego".',
    installBtn: "Zainstaluj",
    installDismiss: "Nie teraz",
  },
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

  // Stato Lingua
  const [lang, setLang] = useState<Lang>("it");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // Stato Banner Installazione PWA
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  // Stato Modale Categoria
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#a855f7");

  // Stato Modale Chat AI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");

  // Vercel AI SDK Hook (transport + body dinamico, include la lingua per l'assistente)
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ transactions, language: lang }),
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const savedTx = localStorage.getItem("budget-dati-v7");
    const savedCat = localStorage.getItem("budget-cat-v7");
    const savedLang = localStorage.getItem("budget-lang-v7");
    if (savedTx) { try { setTransactions(JSON.parse(savedTx)); } catch (e) {} }
    if (savedCat) { try { setCategories(JSON.parse(savedCat)); } catch (e) {} }
    if (savedLang && ["it", "en", "pl"].includes(savedLang)) { setLang(savedLang as Lang); }
    setMounted(true);

    // Rileva se l'app è già installata (aperta come PWA standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("budget-install-dismissed-v7") === "true";
    const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIos(isIosDevice);

    if (!isStandalone && !dismissed && isMobileDevice) {
      setShowInstallBanner(true);
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
    setShowInstallBanner(false);
    localStorage.setItem("budget-install-dismissed-v7", "true");
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

  const openNewModal = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setDate(new Date().toISOString().split("T")[0]);
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
    setIsModalOpen(true);
  };

  const saveTransaction = (e: any) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;

    if (editingId) {
      setTransactions(transactions.map(tx => tx.id === editingId ? {
        ...tx,
        amount: parseFloat(amount),
        type: activeTab,
        categoryId: selectedCategory.id,
        description: description.trim(),
        date: date
      } : tx));
    } else {
      const newTx = {
        id: Date.now(),
        amount: parseFloat(amount),
        type: activeTab,
        categoryId: selectedCategory.id,
        description: description.trim(),
        date: date
      };
      setTransactions([newTx, ...transactions]);
    }

    setIsModalOpen(false);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
    setIsModalOpen(false);
  };

  const addCustomCategory = (e: any) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCat = {
      id: `custom-${Date.now()}`,
      label: newCatName.trim(),
      icon: newCatIcon || "🏷️",
      color: newCatColor
    };

    setCategories({
      ...categories,
      [activeTab]: [...(categories as any)[activeTab], newCat]
    });

    setSelectedCategory(newCat);
    setNewCatName("");
    setIsCatModalOpen(false);
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

  if (!mounted) return null;

  // Restituisce l'etichetta della categoria tradotta (se è una categoria di default),
  // altrimenti il nome esatto digitato dall'utente per le categorie custom.
  const getCategoryData = (type: string, categoryId: string) => {
    const list = (categories as any)[type] || [];
    const cat = list.find((c: any) => c.id === categoryId);
    if (cat) {
      const translatedLabel = CATEGORY_LABELS[lang]?.[cat.id] ?? cat.label;
      return { ...cat, label: translatedLabel, color: getColorHex(cat.color) };
    }
    return { id: categoryId, label: categoryId, icon: "❓", color: "#64748b" };
  };

  const filteredByPeriod = transactions.filter(tx => {
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
    <main className="max-w-md mx-auto min-h-screen bg-[#1e1e1e] text-white font-sans flex flex-col relative">
      
      {/* HEADER */}
      <header className="bg-[#1f3b2d] pt-6 pb-2 px-4 flex flex-col items-center shadow-md z-10 relative rounded-b-3xl">

        {/* SELETTORE LINGUA */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 bg-[#162a20] border border-green-900/40 rounded-full px-2.5 py-1 text-sm"
          >
            <span>{LANGUAGE_META[lang].flag}</span>
          </button>
          {isLangMenuOpen && (
            <div className="absolute top-9 right-0 bg-[#162a20] border border-green-900/40 rounded-xl overflow-hidden shadow-xl min-w-[130px]">
              {(Object.keys(LANGUAGE_META) as Lang[]).map((code) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setIsLangMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-[#1f3b2d] transition-colors ${
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

        <div className="text-center mb-2">
          <p className="text-xs text-gray-300 uppercase tracking-wider">{t.patrimonioTotale}</p>
          <h1 className="text-3xl font-bold">{patrimonioTotale.toFixed(2)} €</h1>
        </div>

        <div className="flex justify-between w-full text-xs text-gray-300 bg-[#162a20] p-2 rounded-xl mb-3 border border-green-900/40">
          <span>💧 {t.liquidita}: <strong className="text-white">{liquidita.toFixed(2)} €</strong></span>
          <span>📈 {t.investitiLabel}: <strong className="text-blue-400">{totaleInvestiti.toFixed(2)} €</strong></span>
        </div>

        {/* TAB NAV */}
        <div className="flex w-full text-sm font-semibold text-gray-400">
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
        <div className="flex justify-between text-xs text-gray-400 mb-3 px-1 bg-[#1e1e1e] p-1.5 rounded-xl">
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

        {/* NAVIGAZIONE DATA */}
        {timeFrame !== "tutti" && (
          <div className="flex justify-between items-center bg-[#1e1e1e]/60 px-4 py-2 rounded-xl mb-4 text-sm font-medium relative">
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
              <span className="text-xs bg-[#2d2d2d] p-1 rounded-md text-gray-400">📅</span>
            </div>
            <button onClick={() => navigatePeriod(1)} className="p-1 hover:text-[#4caf50] text-lg font-bold">❯</button>
          </div>
        )}

        {/* CONFRONTO MACRO-CATEGORIE */}
        <div className="bg-[#1e1e1e] p-3.5 rounded-2xl mb-5 border border-gray-800">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 font-bold">
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

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#10b981]">
              <span className="text-gray-400 text-[10px] block">{t.tabEntrate}</span>
              <strong className="text-[#10b981]">{periodEntrate.toFixed(2)} €</strong>
            </div>
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#ef4444]">
              <span className="text-gray-400 text-[10px] block">{t.tabSpese}</span>
              <strong className="text-[#ef4444]">{periodSpese.toFixed(2)} €</strong>
            </div>
            <div className="bg-[#2d2d2d] p-2 rounded-xl border-t-2 border-[#3b82f6]">
              <span className="text-gray-400 text-[10px] block">{t.tabInvest}</span>
              <strong className="text-[#3b82f6]">{periodInvestiti.toFixed(2)} €</strong>
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
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{tabLabel(activeTab)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LEGENDA CATEGORIE */}
        {categoryBreakdown.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categoryBreakdown.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5 bg-[#1e1e1e] px-2.5 py-1 rounded-full text-xs">
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
                    {tx.description && <p className="text-xs text-gray-400">{tx.description}</p>}
                    <p className="text-[10px] text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-base ${tx.type === "spese" ? "text-white" : tx.type === "entrate" ? "text-[#10b981]" : "text-[#3b82f6]"}`}>
                    {tx.amount.toFixed(2)} €
                  </span>
                  <p className="text-[10px] text-gray-500">{t.modifica}</p>
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <p className="text-center text-gray-500 mt-6 text-sm">{t.nessunMovimento}</p>
          )}
        </div>
      </div>

      {/* BANNER INSTALLAZIONE PWA */}
      {showInstallBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-30 bg-[#1f3b2d] border border-green-900/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📲</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">{t.installTitle}</p>
              <p className="text-xs text-gray-300 mt-1">
                {isIos ? t.installIosSteps : t.installDesc}
              </p>
              <div className="flex gap-2 mt-3">
                {!isIos && deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-[#4caf50] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    {t.installBtn}
                  </button>
                )}
                <button
                  onClick={dismissInstallBanner}
                  className="text-gray-400 text-xs px-3 py-1.5 rounded-lg hover:text-white"
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#ffb74d] rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform z-20"
      >
        <IconPlus />
      </button>

      {/* PULSANTE FLOTTANTE CHATBOT AI */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-[#3b82f6] rounded-full flex items-center justify-center text-white text-2xl shadow-xl hover:scale-105 transition-transform z-20"
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
                  <h3 className="font-bold text-sm">{t.assistenteFinanziario}</h3>
                  <p className="text-[10px] text-gray-400">{t.analizzaDati}</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 p-2 text-lg">✕</button>
            </div>

            {/* MESSAGGI CHAT */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 text-sm">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-xs my-auto p-4 bg-[#1e1e1e] rounded-2xl">
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
                <div className="bg-[#1e1e1e] text-gray-400 p-3 rounded-2xl rounded-bl-none self-start text-xs border border-gray-700 animate-pulse">
                  {t.analizzando}
                </div>
              )}
            </div>

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
                className="flex-1 bg-[#1e1e1e] border border-gray-700 p-3 rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
              />
              <button
                type="submit"
                disabled={isLoading || !chatText.trim()}
                className={`px-4 rounded-xl font-bold text-sm transition-colors ${
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
                  <label className="text-xs text-gray-400 uppercase mb-1 block">{t.importoLabel}</label>
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
                  <label className="text-xs text-gray-400 uppercase mb-1 block">{t.dataLabel}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-sm w-full outline-none focus:border-[#4caf50]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase mb-1 block">{t.descrizioneLabel}</label>
                <input
                  type="text"
                  placeholder={t.descrizionePlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#3a3a3a] p-3 rounded-xl text-white text-sm w-full outline-none focus:border-[#4caf50]"
                />
              </div>

              {/* SELEZIONE CATEGORIA */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-gray-400 uppercase block">{t.selezionaCategoria}</label>
                  <button 
                    type="button" 
                    onClick={() => setIsCatModalOpen(true)}
                    className="text-xs text-[#4caf50] font-bold"
                  >
                    {t.nuovaCategoriaBtn}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {((categories as any)[activeTab] || []).map((cat: any) => {
                    const hexColor = getColorHex(cat.color);
                    const label = CATEGORY_LABELS[lang]?.[cat.id] ?? cat.label;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory({ ...cat, label, color: hexColor })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedCategory?.id === cat.id ? "border-[#4caf50] bg-[#3a3a3a]" : "border-transparent bg-[#1e1e1e]"
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1 shadow-md"
                          style={{ backgroundColor: hexColor }}
                        >
                          {cat.icon}
                        </div>
                        <span className="text-xs text-center text-gray-300">{label}</span>
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
                    className="flex-1 py-3.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold text-sm"
                  >
                    {t.eliminaBtn}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!amount || !selectedCategory}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-base ${
                    !amount || !selectedCategory ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-[#4caf50] text-white"
                  }`}
                >
                  {editingId ? t.aggiornaBtn : t.salvaBtn}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE CREAZIONE NUOVA CATEGORIA */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
          <div className="bg-[#2d2d2d] w-full max-w-xs p-5 rounded-2xl border border-gray-700 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold mb-3">{t.creaCategoriaTitle} ({tabLabel(activeTab)})</h3>
            <form onSubmit={addCustomCategory} className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs text-gray-400 uppercase mb-1 block">{t.nomeCategoriaLabel}</label>
                <input 
                  type="text" 
                  placeholder={t.nomeCategoriaPlaceholder}
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  className="bg-[#1e1e1e] border border-gray-700 p-2.5 rounded-xl text-white text-sm w-full outline-none focus:border-[#4caf50]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase mb-2 block">{t.scegliIconaLabel}</label>
                <div className="grid grid-cols-6 gap-2 bg-[#1e1e1e] p-2 rounded-xl max-h-28 overflow-y-auto mb-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCatIcon(icon)}
                      className={`text-xl p-1 rounded-lg transition-all ${
                        newCatIcon === icon ? "bg-[#4caf50] scale-110" : "hover:bg-[#3a3a3a]"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase mb-2 block">{t.scegliColoreLabel}</label>
                <div className="grid grid-cols-6 gap-2 bg-[#1e1e1e] p-2 rounded-xl mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCatColor === color ? "ring-2 ring-white scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white py-2.5 rounded-xl text-sm font-medium"
                >
                  {t.annullaBtn}
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#4caf50] text-white py-2.5 rounded-xl font-bold text-sm"
                >
                  {t.creaBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}