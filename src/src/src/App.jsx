import { useState, useMemo, useEffect } from "react";
import {
  Home,
  Sparkles,
  Plus,
  Minus,
  Check,
  FileText,
  Printer,
  ArrowRight,
  ArrowLeft,
  Bath,
  ChefHat,
  Bed,
  Sofa,
  Building2,
  Layers,
  Droplets,
  Wind,
  Wrench,
  Trash2,
  Star,
  X,
  User,
  Calendar,
  DollarSign,
  Smartphone,
  Upload,
  AlertCircle,
  Camera,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  ArrowLeftRight,
  Image as ImageIcon,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ============================================================
// PRICING CONFIG — editable rates a cleaning business can tune
// ============================================================
const PRICING = {
  cleaningTypes: {
    standard:     { label: "Standard Clean",      base: 0.10, mult: 1.0, desc: "Routine maintenance clean for lived-in homes" },
    deep:         { label: "Deep Clean",          base: 0.15, mult: 1.5, desc: "Top-to-bottom detailed clean, first-time or seasonal" },
    moveInOut:    { label: "Move In / Move Out",  base: 0.18, mult: 1.75,desc: "Turnover clean inside cabinets, drawers, appliances" },
    postConstruct:{ label: "Post-Construction",   base: 0.22, mult: 2.0, desc: "Heavy dust, debris, film removal after build-out" },
    vacation:     { label: "Vacation Rental Turn",base: 0.14, mult: 1.4, desc: "Short-turn clean with linen swap and staging" },
  },
  flooring: {
    hardwood: { label: "Hardwood",   rate: 0.08, icon: Layers,   desc: "Dust mop + damp mop with wood-safe cleaner" },
    tile:     { label: "Tile",       rate: 0.09, icon: Layers,   desc: "Sweep, mop; grout spot-treat" },
    carpet:   { label: "Carpet",     rate: 0.07, icon: Layers,   desc: "Vacuum with edge detail and traffic-lane attention" },
    laminate: { label: "Laminate",   rate: 0.07, icon: Layers,   desc: "Dry sweep + damp microfiber" },
    vinyl:    { label: "Vinyl / LVP",rate: 0.07, icon: Layers,   desc: "Sweep and mop with pH-neutral cleaner" },
    stone:    { label: "Natural Stone", rate: 0.11, icon: Layers,desc: "Stone-safe cleaner, no acidic solutions" },
  },
  rooms: {
    bathroom:{ label: "Bathroom",     price: 35, icon: Bath,    desc: "Tub, shower, toilet, sinks, mirrors, floor" },
    kitchen: { label: "Kitchen",      price: 50, icon: ChefHat, desc: "Counters, stovetop, sink, exterior appliances, floor" },
    bedroom: { label: "Bedroom",      price: 20, icon: Bed,     desc: "Dust, vacuum, make bed, wipe surfaces" },
    living:  { label: "Living Area",  price: 25, icon: Sofa,    desc: "Dust, vacuum, tidy surfaces, wipe electronics" },
    office:  { label: "Home Office",  price: 22, icon: Building2,desc: "Dust, vacuum, wipe desk surfaces (no paper handling)" },
    dining:  { label: "Dining Room",  price: 18, icon: Sofa,    desc: "Dust, polish table, vacuum, wipe chairs" },
  },
  addons: {
    interior_windows:{ label: "Interior Windows",    price: 45, icon: Wind,     desc: "Glass, sills, tracks for interior-facing windows" },
    inside_fridge:   { label: "Inside Refrigerator", price: 35, icon: Wrench,   desc: "Empty, wipe shelves and drawers, reorganize" },
    inside_oven:     { label: "Inside Oven",         price: 40, icon: Wrench,   desc: "Degrease interior, racks, glass" },
    inside_cabinets: { label: "Inside Cabinets",     price: 60, icon: Wrench,   desc: "Empty, wipe interiors, reline if materials provided" },
    laundry:         { label: "Laundry (1 load)",    price: 20, icon: Droplets, desc: "Wash, dry, fold one standard load" },
    linen_change:    { label: "Linen Change",        price: 15, icon: Bed,      desc: "Strip and remake beds with provided linens (per bed)" },
    garage:          { label: "Garage Sweep",        price: 50, icon: Wrench,   desc: "Sweep, cobweb removal, tidy shelving" },
    baseboards:      { label: "Detail Baseboards",   price: 40, icon: Sparkles, desc: "Hand-wipe all baseboards throughout" },
    blinds:          { label: "Blinds Detail",       price: 35, icon: Wind,     desc: "Dust and wipe each blind slat" },
    wall_spot:       { label: "Wall Spot Clean",     price: 25, icon: Sparkles, desc: "Spot-clean visible scuffs and marks on walls" },
    trash:           { label: "Trash Haul-Away",     price: 30, icon: Trash2,   desc: "Bag and remove trash to curb or designated area" },
    petHair:         { label: "Pet Hair Treatment",  price: 35, icon: Sparkles, desc: "Specialty vacuum + lint attention for pet households" },
  },
  frequency: {
    oneTime: { label: "One-Time",  mult: 1.0,  desc: "Single visit" },
    weekly:  { label: "Weekly",    mult: 0.80, desc: "20% recurring discount" },
    biweekly:{ label: "Bi-Weekly", mult: 0.85, desc: "15% recurring discount" },
    monthly: { label: "Monthly",   mult: 0.92, desc: "8% recurring discount" },
  },
};

const TAX_RATE = 0.0; // set to e.g. 0.101 for Seattle if taxable

// ============================================================
// Small primitives
// ============================================================
const fmt = (n) => `$${n.toFixed(2)}`;

function StepDot({ active, done, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold border transition-all ${
          active
            ? "bg-stone-900 text-stone-50 border-stone-900"
            : done
            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
            : "bg-white text-stone-400 border-stone-200"
        }`}
      >
        {done ? <Check size={16} /> : label[0]}
      </span>
      <span
        className={`text-[11px] tracking-wide uppercase ${
          active ? "text-stone-900 font-medium" : "text-stone-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function Card({ selected, onClick, children, compact = false }) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left w-full rounded-xl border transition-all ${
        compact ? "p-3" : "p-4"
      } ${
        selected
          ? "border-stone-900 bg-stone-900 text-stone-50 shadow-sm"
          : "border-stone-200 bg-white text-stone-800 hover:border-stone-400 hover:shadow-sm"
      }`}
    >
      {children}
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-stone-50 text-stone-900 flex items-center justify-center">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function Counter({ value, onChange, min = 0, max = 20 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white overflow-hidden">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30"
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function CleaningEstimator() {
  // mode: 'estimate' (build + review) | 'job' (approved checklist in progress)
  const [mode, setMode] = useState("estimate");
  const [step, setStep] = useState(0);

  // Client / property
  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    serviceDate: "",
  });

  // Home details
  const [sqft, setSqft] = useState(1500);
  const [stories, setStories] = useState(1);

  // Flooring: percent allocation across floor types (sums to 100)
  const [flooring, setFlooring] = useState({
    hardwood: 40,
    carpet: 40,
    tile: 20,
    laminate: 0,
    vinyl: 0,
    stone: 0,
  });

  // Cleaning type
  const [cleaningType, setCleaningType] = useState("standard");
  const [frequency, setFrequency] = useState("oneTime");

  // Room counts
  const [rooms, setRooms] = useState({
    bathroom: 2,
    kitchen: 1,
    bedroom: 3,
    living: 1,
    office: 0,
    dining: 1,
  });

  // Add-ons (ids -> qty)
  const [addons, setAddons] = useState({});

  // Notes
  const [notes, setNotes] = useState("");

  // ---- derived pricing ----
  const calc = useMemo(() => {
    const type = PRICING.cleaningTypes[cleaningType];

    // Square footage base scaled by cleaning type
    const sqftBase = sqft * type.base * type.mult;

    // Flooring surcharge — weight each flooring rate by its % share
    const flooringTotal = Object.entries(flooring).reduce((sum, [k, pct]) => {
      const f = PRICING.flooring[k];
      if (!f) return sum;
      return sum + sqft * (pct / 100) * f.rate;
    }, 0);

    // Stories — 10% bump per additional floor
    const storiesMult = 1 + (stories - 1) * 0.1;

    // Rooms
    const roomTotal = Object.entries(rooms).reduce((sum, [k, qty]) => {
      const r = PRICING.rooms[k];
      if (!r) return sum;
      return sum + r.price * qty * type.mult;
    }, 0);

    // Add-ons
    const addonTotal = Object.entries(addons).reduce((sum, [k, qty]) => {
      const a = PRICING.addons[k];
      if (!a) return sum;
      return sum + a.price * qty;
    }, 0);

    const subBeforeFreq = (sqftBase + flooringTotal) * storiesMult + roomTotal + addonTotal;
    const freq = PRICING.frequency[frequency];
    const subtotal = subBeforeFreq * freq.mult;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // Time estimate (minutes) — rough model
    const baseMinutes = (sqft / 1000) * 90 * type.mult;
    const roomMinutes = Object.entries(rooms).reduce(
      (s, [k, q]) => s + q * (k === "kitchen" ? 35 : k === "bathroom" ? 25 : 15),
      0
    );
    const addonMinutes = Object.entries(addons).reduce(
      (s, [k, q]) => s + q * 20,
      0
    );
    const totalMinutes = (baseMinutes + roomMinutes + addonMinutes) * storiesMult;
    const hours = totalMinutes / 60;

    return {
      sqftBase,
      flooringTotal,
      storiesMult,
      roomTotal,
      addonTotal,
      subtotal,
      tax,
      total,
      hours,
      freqMult: freq.mult,
    };
  }, [sqft, stories, flooring, cleaningType, rooms, addons, frequency]);

  const flooringSum = Object.values(flooring).reduce((a, b) => a + b, 0);

  // Normalize flooring when one value changes (keep it at 100)
  const setFloorPct = (key, val) => {
    setFlooring((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  };

  const toggleAddon = (key) => {
    setAddons((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = 1;
      return next;
    });
  };

  const setAddonQty = (key, qty) => {
    setAddons((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });
  };

  const steps = [
    { key: "client", label: "Client" },
    { key: "home", label: "Home" },
    { key: "service", label: "Service" },
    { key: "rooms", label: "Rooms" },
    { key: "addons", label: "Add-Ons" },
    { key: "review", label: "Review" },
  ];

  const canNext = useMemo(() => {
    if (step === 0) return client.name.trim().length > 0;
    if (step === 1) return sqft > 0 && flooringSum === 100;
    return true;
  }, [step, client, sqft, flooringSum]);

  // ============================================================
  // RENDER STEPS
  // ============================================================
  const renderStep = () => {
    switch (step) {
      case 0:
        return <ClientStep client={client} setClient={setClient} />;
      case 1:
        return (
          <HomeStep
            sqft={sqft}
            setSqft={setSqft}
            stories={stories}
            setStories={setStories}
            flooring={flooring}
            setFloorPct={setFloorPct}
            flooringSum={flooringSum}
          />
        );
      case 2:
        return (
          <ServiceStep
            cleaningType={cleaningType}
            setCleaningType={setCleaningType}
            frequency={frequency}
            setFrequency={setFrequency}
          />
        );
      case 3:
        return <RoomsStep rooms={rooms} setRooms={setRooms} />;
      case 4:
        return <AddonsStep addons={addons} toggleAddon={toggleAddon} setAddonQty={setAddonQty} />;
      case 5:
        return (
          <ReviewStep
            client={client}
            sqft={sqft}
            stories={stories}
            flooring={flooring}
            cleaningType={cleaningType}
            frequency={frequency}
            rooms={rooms}
            addons={addons}
            calc={calc}
            notes={notes}
            setNotes={setNotes}
          />
        );
      default:
        return null;
    }
  };

  // If approved, switch into job/checklist mode
  if (mode === "job") {
    return (
      <JobChecklist
        client={client}
        sqft={sqft}
        stories={stories}
        flooring={flooring}
        cleaningType={cleaningType}
        frequency={frequency}
        rooms={rooms}
        addons={addons}
        notes={notes}
        calc={calc}
        onBackToEstimate={() => setMode("estimate")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900" style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}>
      {/* Header */}
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-stone-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                Cleaning Estimator
              </div>
              <div className="text-lg leading-tight">Meridian Home Care</div>
            </div>
          </div>
          <div className="text-right hidden sm:block" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="text-[11px] tracking-widest uppercase text-stone-500">Estimate Total</div>
            <div className="text-2xl font-semibold tabular-nums">{fmt(calc.total)}</div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-start justify-between relative">
          <div className="absolute left-0 right-0 top-[18px] h-px bg-stone-200 -z-0" />
          {steps.map((s, i) => (
            <div key={s.key} className="relative z-10 bg-stone-100 px-2">
              <StepDot
                active={step === i}
                done={step > i}
                label={s.label}
                onClick={() => setStep(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Body grid */}
      <main className="max-w-6xl mx-auto px-6 pb-32 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {renderStep()}
        </section>

        {/* Live summary rail */}
        <aside className="lg:sticky lg:top-6">
          <SummaryRail
            calc={calc}
            cleaningType={cleaningType}
            frequency={frequency}
            sqft={sqft}
            rooms={rooms}
            addons={addons}
          />
        </aside>
      </main>

      {/* Footer nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 text-sm font-medium disabled:opacity-30 hover:bg-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-[11px] tracking-widest uppercase text-stone-500 hidden sm:block">
            Step {step + 1} of {steps.length}
          </div>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              disabled={!canNext}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-stone-900 text-stone-50 text-sm font-medium disabled:opacity-40 hover:bg-stone-800"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 text-sm font-medium hover:bg-white"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={() => setMode("job")}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-700 text-stone-50 text-sm font-medium hover:bg-emerald-800"
              >
                <ClipboardCheck size={16} /> Approve & Start Job
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

// ============================================================
// STEP 0 — Client
// ============================================================

// Minimal vCard parser — handles VERSION 2.1, 3.0, 4.0 basics (FN, N, EMAIL, TEL, ADR)
function parseVCard(text) {
  // Unfold folded lines (continuation lines start with space or tab per RFC 6350)
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const result = { name: "", email: "", phone: "", address: "" };

  for (const line of lines) {
    if (!line || line.startsWith("BEGIN:") || line.startsWith("END:") || line.startsWith("VERSION")) continue;

    // Separate params from value: "TEL;TYPE=CELL:555-1234"
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const rawKey = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const key = rawKey.split(";")[0];

    if (key === "FN" && !result.name) {
      result.name = value.trim();
    } else if (key === "N" && !result.name) {
      // N:Family;Given;Middle;Prefix;Suffix
      const parts = value.split(";");
      const given = parts[1] || "";
      const family = parts[0] || "";
      result.name = `${given} ${family}`.trim();
    } else if (key === "EMAIL" && !result.email) {
      result.email = value.trim();
    } else if (key === "TEL" && !result.phone) {
      // Prefer CELL/MOBILE if multiple
      result.phone = value.trim();
    } else if (key === "ADR" && !result.address) {
      // ADR:PObox;Extended;Street;City;Region;PostalCode;Country
      const parts = value.split(";").map((p) => p.trim());
      const street = parts[2] || "";
      const city = parts[3] || "";
      const region = parts[4] || "";
      const postal = parts[5] || "";
      result.address = [street, city, region, postal].filter(Boolean).join(", ");
    }
  }

  return result;
}

function ClientStep({ client, setClient }) {
  const field = "block w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50 focus:border-stone-900 focus:bg-white outline-none text-stone-900";

  const [importMsg, setImportMsg] = useState(null); // { type: 'success'|'error'|'info', text: string }
  const [pickerSupported, setPickerSupported] = useState(false);

  useEffect(() => {
    // Contact Picker API is only on Android Chrome (and a few Chromium mobile browsers)
    if (typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window) {
      setPickerSupported(true);
    }
  }, []);

  const handleContactPicker = async () => {
    setImportMsg(null);
    try {
      const props = ["name", "email", "tel", "address"];
      const opts = { multiple: false };
      // Some browsers only support a subset — filter to what's available
      const supported = await navigator.contacts.getProperties();
      const useProps = props.filter((p) => supported.includes(p));

      const contacts = await navigator.contacts.select(useProps, opts);
      if (!contacts || contacts.length === 0) {
        setImportMsg({ type: "info", text: "No contact selected." });
        return;
      }
      const c = contacts[0];
      const name = (c.name && c.name[0]) || "";
      const email = (c.email && c.email[0]) || "";
      const phone = (c.tel && c.tel[0]) || "";
      let address = "";
      if (c.address && c.address[0]) {
        const a = c.address[0];
        const parts = [
          (a.addressLine && a.addressLine.join(" ")) || "",
          a.city || "",
          a.region || "",
          a.postalCode || "",
        ].filter(Boolean);
        address = parts.join(", ");
      }
      setClient({ ...client, name, email, phone, address });
      setImportMsg({ type: "success", text: `Imported contact: ${name || "Unnamed"}` });
    } catch (err) {
      setImportMsg({ type: "error", text: `Picker unavailable: ${err.message || "unknown error"}` });
    }
  };

  const handleVCardUpload = async (e) => {
    setImportMsg(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseVCard(text);
      if (!parsed.name && !parsed.email && !parsed.phone) {
        setImportMsg({ type: "error", text: "Couldn't read that file. Make sure it's a .vcf contact card." });
        return;
      }
      setClient({
        ...client,
        name: parsed.name || client.name,
        email: parsed.email || client.email,
        phone: parsed.phone || client.phone,
        address: parsed.address || client.address,
      });
      setImportMsg({ type: "success", text: `Imported: ${parsed.name || "Contact"}` });
    } catch (err) {
      setImportMsg({ type: "error", text: "Failed to read file." });
    } finally {
      // Reset input so the same file can be re-uploaded if needed
      e.target.value = "";
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="01 — Client" title="Who's the estimate for?" />

      {/* Import options */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-3">Import from contacts</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleContactPicker}
            disabled={!pickerSupported}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed"
            title={pickerSupported ? "Open phone contact picker" : "Only available on Android Chrome"}
          >
            <Smartphone size={15} />
            Pick from phone
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:border-stone-500 cursor-pointer">
            <Upload size={15} />
            Upload .vcf card
            <input type="file" accept=".vcf,text/vcard,text/x-vcard" onChange={handleVCardUpload} className="hidden" />
          </label>

          <button
            onClick={() => setClient({ name: "", email: "", phone: "", address: "", serviceDate: client.serviceDate })}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-stone-500 text-sm hover:text-stone-900"
          >
            Clear
          </button>
        </div>

        {!pickerSupported && (
          <div className="mt-3 text-[12px] text-stone-500 flex items-start gap-1.5">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>
              "Pick from phone" works on Android Chrome only. On iPhone, open Contacts → share → save the .vcf file, then upload it here.
            </span>
          </div>
        )}

        {importMsg && (
          <div
            className={`mt-3 text-[12px] flex items-start gap-1.5 ${
              importMsg.type === "success"
                ? "text-emerald-700"
                : importMsg.type === "error"
                ? "text-rose-600"
                : "text-stone-500"
            }`}
          >
            {importMsg.type === "success" ? (
              <Check size={13} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
            )}
            <span>{importMsg.text}</span>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Field label="Client name">
          <input className={field} value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <input className={field} value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone">
          <input className={field} value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="(555) 555-5555" />
        </Field>
        <Field label="Service date">
          <input type="date" className={field} value={client.serviceDate} onChange={(e) => setClient({ ...client, serviceDate: e.target.value })} />
        </Field>
        <Field label="Service address" full>
          <input className={field} value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} placeholder="123 Main St, Seattle, WA" />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] tracking-widest uppercase text-stone-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// ============================================================
// STEP 1 — Home details
// ============================================================
function HomeStep({ sqft, setSqft, stories, setStories, flooring, setFloorPct, flooringSum }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="02 — Home" title="Tell us about the space." />

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-stone-200 p-5 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-700 mb-1">
            <Home size={16} />
            <span className="text-[11px] tracking-widest uppercase">Square footage</span>
          </div>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(Math.max(0, parseInt(e.target.value || 0)))}
            className="w-full bg-transparent text-3xl font-semibold outline-none"
          />
          <input
            type="range"
            min={400}
            max={8000}
            step={50}
            value={sqft}
            onChange={(e) => setSqft(parseInt(e.target.value))}
            className="w-full mt-3 accent-stone-900"
          />
          <div className="flex justify-between text-[11px] text-stone-400 mt-1">
            <span>400</span><span>8,000</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 p-5 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-700 mb-3">
            <Building2 size={16} />
            <span className="text-[11px] tracking-widest uppercase">Number of floors</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-semibold">{stories}</div>
            <Counter value={stories} onChange={setStories} min={1} max={5} />
          </div>
          <div className="text-[12px] text-stone-500 mt-3">
            Multi-story homes add a small premium for stair work and vacuum logistics.
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-stone-500">Flooring composition</div>
            <div className="text-stone-900 font-medium">Allocate by % — should total 100%</div>
          </div>
          <div className={`text-sm font-semibold tabular-nums ${flooringSum === 100 ? "text-emerald-700" : "text-amber-600"}`}>
            {flooringSum}%
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(PRICING.flooring).map(([key, f]) => {
            const Icon = f.icon;
            const pct = flooring[key] || 0;
            return (
              <div key={key} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-stone-600" />
                    <span className="font-medium text-stone-900">{f.label}</span>
                  </div>
                  <span className="text-sm tabular-nums font-semibold w-10 text-right">{pct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) => setFloorPct(key, parseInt(e.target.value))}
                  className="w-full mt-3 accent-stone-900"
                />
                <div className="text-[11px] text-stone-500 mt-1">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — Service type + frequency
// ============================================================
function ServiceStep({ cleaningType, setCleaningType, frequency, setFrequency }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="03 — Service" title="What kind of clean, and how often?" />

      <div className="mt-6">
        <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-3">Cleaning type</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(PRICING.cleaningTypes).map(([key, t]) => (
            <Card key={key} selected={cleaningType === key} onClick={() => setCleaningType(key)}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  cleaningType === key ? "bg-stone-50 text-stone-900" : "bg-stone-100 text-stone-700"
                }`}>
                  <Star size={16} />
                </div>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className={`text-[12px] mt-0.5 ${cleaningType === key ? "text-stone-300" : "text-stone-500"}`}>
                    {t.desc}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-3">Frequency</div>
        <div className="grid sm:grid-cols-4 gap-3">
          {Object.entries(PRICING.frequency).map(([key, f]) => (
            <Card key={key} selected={frequency === key} onClick={() => setFrequency(key)} compact>
              <div className="text-sm font-medium">{f.label}</div>
              <div className={`text-[11px] mt-0.5 ${frequency === key ? "text-stone-300" : "text-stone-500"}`}>
                {f.desc}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 3 — Rooms
// ============================================================
function RoomsStep({ rooms, setRooms }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="04 — Rooms" title="How many of each?" />

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {Object.entries(PRICING.rooms).map(([key, r]) => {
          const Icon = r.icon;
          const qty = rooms[key] || 0;
          return (
            <div key={key} className="rounded-xl border border-stone-200 bg-white p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-700">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-stone-900">{r.label}</span>
                    <span className="text-[11px] text-stone-500 tabular-nums">{fmt(r.price)} ea</span>
                  </div>
                  <div className="text-[12px] text-stone-500 truncate">{r.desc}</div>
                </div>
              </div>
              <Counter value={qty} onChange={(v) => setRooms({ ...rooms, [key]: v })} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STEP 4 — Add-Ons
// ============================================================
function AddonsStep({ addons, toggleAddon, setAddonQty }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="05 — Add-Ons" title="Tap anything extra the client wants." />

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {Object.entries(PRICING.addons).map(([key, a]) => {
          const Icon = a.icon;
          const selected = !!addons[key];
          const qty = addons[key] || 0;
          return (
            <div key={key} className={`rounded-xl border transition-all ${selected ? "border-stone-900 bg-stone-900 text-stone-50" : "border-stone-200 bg-white text-stone-800"}`}>
              <button onClick={() => toggleAddon(key)} className="w-full text-left p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-stone-50 text-stone-900" : "bg-stone-100 text-stone-700"}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{a.label}</div>
                    <div className={`text-sm tabular-nums ${selected ? "text-stone-200" : "text-stone-500"}`}>
                      {fmt(a.price)}
                    </div>
                  </div>
                  <div className={`text-[12px] mt-0.5 ${selected ? "text-stone-300" : "text-stone-500"}`}>
                    {a.desc}
                  </div>
                </div>
                {selected && (
                  <span className="w-5 h-5 rounded-full bg-stone-50 text-stone-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
              {selected && (
                <div className="px-4 pb-4 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-stone-300">Quantity</span>
                  <Counter value={qty} onChange={(v) => setAddonQty(key, v)} min={0} max={10} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STEP 5 — Review & generated scope
// ============================================================
function ReviewStep({ client, sqft, stories, flooring, cleaningType, frequency, rooms, addons, calc, notes, setNotes }) {
  const type = PRICING.cleaningTypes[cleaningType];
  const freq = PRICING.frequency[frequency];

  // Generate scope lines
  const scope = useMemo(() => {
    const lines = [];
    lines.push(`${type.label} service for approximately ${sqft.toLocaleString()} sq ft across ${stories} floor${stories > 1 ? "s" : ""}.`);

    const floorParts = Object.entries(flooring).filter(([, v]) => v > 0).map(([k, v]) => `${v}% ${PRICING.flooring[k].label.toLowerCase()}`);
    if (floorParts.length) lines.push(`Flooring treated: ${floorParts.join(", ")}.`);

    Object.entries(rooms).forEach(([k, q]) => {
      if (q > 0) lines.push(`(${q}) ${PRICING.rooms[k].label}${q > 1 ? "s" : ""}: ${PRICING.rooms[k].desc}.`);
    });

    Object.entries(addons).forEach(([k, q]) => {
      if (q > 0) lines.push(`Add-on — ${PRICING.addons[k].label}${q > 1 ? ` ×${q}` : ""}: ${PRICING.addons[k].desc}.`);
    });

    return lines;
  }, [sqft, stories, flooring, cleaningType, rooms, addons]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SectionTitle eyebrow="06 — Review" title="Estimate ready to send." />

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <InfoBlock icon={User} label="Client" value={client.name || "—"} sub={client.email || client.phone || client.address} />
        <InfoBlock icon={Calendar} label="Service date" value={client.serviceDate || "TBD"} sub={freq.label} />
        <InfoBlock icon={Home} label="Home" value={`${sqft.toLocaleString()} sq ft`} sub={`${stories} floor${stories > 1 ? "s" : ""}`} />
        <InfoBlock icon={Sparkles} label="Service" value={type.label} sub={`Est. ${calc.hours.toFixed(1)} labor hours`} />
      </div>

      <div className="mt-8">
        <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-3 flex items-center gap-2">
          <FileText size={14} /> Detailed scope of work
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
          <ul className="space-y-2">
            {scope.map((l, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-stone-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-2">Notes for client</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Parking instructions, pet notes, access code, preferred products, etc."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-stone-50 focus:border-stone-900 focus:bg-white outline-none text-[13px]"
        />
      </div>

      {/* Breakdown */}
      <div className="mt-8 rounded-xl border border-stone-200 overflow-hidden">
        <div className="bg-stone-900 text-stone-50 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest">Price breakdown</span>
          <DollarSign size={14} />
        </div>
        <div className="divide-y divide-stone-100">
          <Row label={`Square footage base (${type.label})`} value={fmt(calc.sqftBase)} />
          <Row label="Flooring surcharge" value={fmt(calc.flooringTotal)} />
          {stories > 1 && <Row label={`Multi-story factor (×${calc.storiesMult.toFixed(2)})`} value="" muted />}
          <Row label="Rooms" value={fmt(calc.roomTotal)} />
          <Row label="Add-ons" value={fmt(calc.addonTotal)} />
          {freq.mult !== 1 && (
            <Row label={`Frequency adjustment (${freq.label})`} value={`×${freq.mult}`} muted />
          )}
          <Row label="Subtotal" value={fmt(calc.subtotal)} emphasize />
          {TAX_RATE > 0 && <Row label="Tax" value={fmt(calc.tax)} />}
          <div className="px-5 py-4 flex items-center justify-between bg-stone-50">
            <span className="text-[11px] uppercase tracking-widest text-stone-500">Total</span>
            <span className="text-2xl font-semibold tabular-nums">{fmt(calc.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, emphasize }) {
  return (
    <div className={`px-5 py-2.5 flex items-center justify-between text-[13px] ${emphasize ? "bg-stone-50 font-semibold" : ""}`}>
      <span className={muted ? "text-stone-500" : "text-stone-700"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-stone-200 p-4 bg-stone-50">
      <div className="flex items-center gap-2 text-stone-500 mb-1">
        <Icon size={14} />
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-stone-900 font-medium truncate">{value}</div>
      {sub && <div className="text-[12px] text-stone-500 truncate">{sub}</div>}
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.25em] uppercase text-stone-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl mt-1 text-stone-900" style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}>
        {title}
      </h2>
    </div>
  );
}

// ============================================================
// SUMMARY RAIL
// ============================================================
function SummaryRail({ calc, cleaningType, frequency, sqft, rooms, addons }) {
  const type = PRICING.cleaningTypes[cleaningType];
  const freq = PRICING.frequency[frequency];
  const roomCount = Object.values(rooms).reduce((a, b) => a + b, 0);
  const addonCount = Object.values(addons).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl bg-stone-900 text-stone-50 p-6 shadow-lg" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="text-[11px] uppercase tracking-[0.25em] text-stone-400">Live Estimate</div>
      <div className="mt-2 text-5xl font-semibold tabular-nums" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        {fmt(calc.total)}
      </div>
      <div className="mt-1 text-[12px] text-stone-400">
        ≈ {calc.hours.toFixed(1)} labor hours
      </div>

      <div className="mt-6 space-y-3 text-[13px]">
        <MiniRow label="Service" value={type.label} />
        <MiniRow label="Frequency" value={freq.label} />
        <MiniRow label="Square footage" value={`${sqft.toLocaleString()} sf`} />
        <MiniRow label="Rooms" value={roomCount} />
        <MiniRow label="Add-ons" value={addonCount} />
      </div>

      <div className="mt-6 pt-5 border-t border-stone-700 text-[12px] text-stone-400 leading-relaxed">
        Pricing updates as you make selections. Final total is confirmed in Review.
      </div>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-50 font-medium">{value}</span>
    </div>
  );
}

// ============================================================
// TASK LIBRARY — what each room/add-on actually means as checklist tasks
// ============================================================
const TASK_LIBRARY = {
  rooms: {
    bathroom: [
      "Scrub tub / shower walls and fixtures",
      "Clean and disinfect toilet (bowl, seat, base)",
      "Clean and polish sink and countertop",
      "Clean mirror and wipe frame",
      "Wipe down cabinet exteriors and handles",
      "Empty trash and replace liner",
      "Sweep and mop floor",
    ],
    kitchen: [
      "Clean stovetop, knobs, and backsplash",
      "Wipe exterior of oven, microwave, fridge, dishwasher",
      "Clean and sanitize countertops",
      "Scrub and disinfect sink and faucet",
      "Wipe cabinet fronts and handles",
      "Wipe down small appliances (toaster, coffee maker)",
      "Empty trash and replace liner",
      "Sweep and mop floor",
    ],
    bedroom: [
      "Dust all surfaces (dressers, nightstands, shelves)",
      "Make bed / straighten linens",
      "Dust picture frames and décor",
      "Wipe door handles and light switches",
      "Empty wastebasket",
      "Vacuum or sweep floor",
    ],
    living: [
      "Dust all surfaces and décor",
      "Wipe down electronics (TV, remotes, consoles)",
      "Fluff and straighten cushions",
      "Clean glass surfaces (coffee tables, etc.)",
      "Wipe light switches and door handles",
      "Vacuum upholstery and floor",
    ],
    office: [
      "Dust desk surface (do not handle papers)",
      "Wipe monitor, keyboard, and mouse",
      "Empty wastebasket",
      "Wipe door handles and light switches",
      "Vacuum or sweep floor",
    ],
    dining: [
      "Dust and polish dining table",
      "Wipe chairs and chair legs",
      "Dust light fixture / chandelier (reachable)",
      "Wipe sideboard / buffet surfaces",
      "Vacuum or sweep floor",
    ],
  },
  flooring: {
    hardwood: "Dust-mop then damp-mop with wood-safe cleaner (no standing water)",
    tile: "Sweep, mop, and spot-treat grout lines",
    carpet: "Vacuum entire surface including edges and traffic lanes",
    laminate: "Dry sweep then damp microfiber (no standing water)",
    vinyl: "Sweep and mop with pH-neutral cleaner",
    stone: "Clean with stone-safe cleaner only — no acidic products",
  },
  addons: {
    interior_windows: ["Clean interior glass, sills, and tracks"],
    inside_fridge: [
      "Empty fridge contents",
      "Wipe shelves, drawers, and door bins",
      "Return items organized and discard expired goods (with approval)",
    ],
    inside_oven: [
      "Remove racks and soak",
      "Degrease oven interior walls and floor",
      "Clean oven door glass inside and out",
      "Replace racks",
    ],
    inside_cabinets: [
      "Empty cabinet contents",
      "Wipe interior surfaces",
      "Reline shelves if materials provided",
      "Return items organized",
    ],
    laundry: ["Wash, dry, and fold one standard load"],
    linen_change: ["Strip bed", "Remake bed with provided linens"],
    garage: ["Sweep floor", "Remove cobwebs", "Tidy visible shelving"],
    baseboards: ["Hand-wipe all baseboards throughout home"],
    blinds: ["Dust and wipe each blind slat individually"],
    wall_spot: ["Spot-clean visible scuffs and marks on walls"],
    trash: ["Collect trash from all rooms", "Bag and remove to curb or designated area"],
    petHair: ["Specialty vacuum pass", "Lint-roll upholstery and high-traffic fabric surfaces"],
  },
  finalWalkthrough: [
    "Final walkthrough — all surfaces visually clean",
    "All lights turned off and doors secured",
    "Cleaning supplies packed and removed",
    "Trash taken out",
  ],
};

// Build flat ordered section list from an approved estimate
function buildJobSections({ rooms, flooring, addons }) {
  const sections = [];

  // A room section per room instance (e.g. 2 bathrooms → Bathroom 1, Bathroom 2)
  Object.entries(rooms).forEach(([roomKey, count]) => {
    if (count <= 0) return;
    const tasks = TASK_LIBRARY.rooms[roomKey] || [];
    const label = PRICING.rooms[roomKey].label;
    for (let i = 1; i <= count; i++) {
      sections.push({
        id: `${roomKey}-${i}`,
        title: count > 1 ? `${label} ${i}` : label,
        icon: PRICING.rooms[roomKey].icon,
        tasks: tasks.map((t, idx) => ({ id: `${roomKey}-${i}-t${idx}`, text: t })),
      });
    }
  });

  // Flooring section — only for flooring types actually in the home
  const activeFloors = Object.entries(flooring).filter(([, pct]) => pct > 0);
  if (activeFloors.length) {
    sections.push({
      id: "flooring",
      title: "Flooring Care",
      icon: Layers,
      tasks: activeFloors.map(([k], idx) => ({
        id: `floor-${k}`,
        text: `${PRICING.flooring[k].label}: ${TASK_LIBRARY.flooring[k]}`,
      })),
    });
  }

  // Add-ons section — each add-on may expand into multiple tasks
  const activeAddons = Object.entries(addons).filter(([, q]) => q > 0);
  if (activeAddons.length) {
    const tasks = [];
    activeAddons.forEach(([k, q]) => {
      const label = PRICING.addons[k].label;
      const subTasks = TASK_LIBRARY.addons[k] || [PRICING.addons[k].desc];
      subTasks.forEach((st, idx) => {
        tasks.push({
          id: `addon-${k}-${idx}`,
          text: q > 1 ? `${label} (×${q}) — ${st}` : `${label} — ${st}`,
        });
      });
    });
    sections.push({ id: "addons", title: "Add-On Services", icon: Sparkles, tasks });
  }

  // Final walkthrough always last
  sections.push({
    id: "final",
    title: "Final Walkthrough",
    icon: CheckCircle2,
    tasks: TASK_LIBRARY.finalWalkthrough.map((t, idx) => ({
      id: `final-t${idx}`,
      text: t,
    })),
  });

  return sections;
}

// ============================================================
// JOB CHECKLIST — approved estimate becomes a working job sheet
// ============================================================
function JobChecklist({
  client,
  sqft,
  stories,
  flooring,
  cleaningType,
  frequency,
  rooms,
  addons,
  notes,
  calc,
  onBackToEstimate,
}) {
  const sections = useMemo(
    () => buildJobSections({ rooms, flooring, addons }),
    [rooms, flooring, addons]
  );

  // taskState: { [taskId]: { done: bool, before: dataURL|null, after: dataURL|null } }
  const [taskState, setTaskState] = useState(() => {
    const init = {};
    sections.forEach((s) => s.tasks.forEach((t) => {
      init[t.id] = { done: false, before: null, after: null };
    }));
    return init;
  });

  const [openSections, setOpenSections] = useState(() => {
    const map = {};
    sections.forEach((s, i) => { map[s.id] = i === 0; });
    return map;
  });

  const [jobStartedAt] = useState(() => new Date());
  const [jobCompletedAt, setJobCompletedAt] = useState(null);

  // Photo modal state
  const [photoModal, setPhotoModal] = useState(null); // { taskId, taskText, kind: 'before'|'after' }

  const toggleTask = (taskId) => {
    setTaskState((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], done: !prev[taskId].done },
    }));
  };

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const savePhoto = (taskId, kind, dataUrl) => {
    setTaskState((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [kind]: dataUrl },
    }));
  };

  const clearPhoto = (taskId, kind) => {
    setTaskState((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [kind]: null },
    }));
  };

  // Progress
  const allTasks = sections.flatMap((s) => s.tasks);
  const doneCount = allTasks.filter((t) => taskState[t.id]?.done).length;
  const progressPct = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
  const allDone = doneCount === allTasks.length && allTasks.length > 0;

  const photoCount = allTasks.reduce(
    (sum, t) => sum + (taskState[t.id]?.before ? 1 : 0) + (taskState[t.id]?.after ? 1 : 0),
    0
  );

  const elapsed = useElapsed(jobStartedAt, jobCompletedAt);

  const handleComplete = () => {
    setJobCompletedAt(new Date());
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBackToEstimate}
              className="flex items-center gap-1.5 text-[12px] text-stone-500 hover:text-stone-900"
            >
              <ArrowLeft size={14} /> Back to estimate
            </button>
            <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-stone-500">
              <Clock size={12} /> {elapsed}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] tracking-[0.2em] uppercase text-stone-500">Active Job</div>
              <div
                className="text-xl sm:text-2xl font-semibold truncate text-stone-900"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {client.name || "Unnamed Client"}
              </div>
              <div className="text-[12px] text-stone-500 truncate">
                {PRICING.cleaningTypes[cleaningType].label} · {sqft.toLocaleString()} sf · {client.address || "No address"}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] tracking-widest uppercase text-stone-500">Progress</div>
              <div className="text-2xl font-semibold tabular-nums">{progressPct}%</div>
              <div className="text-[11px] text-stone-500">{doneCount} / {allTasks.length}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-stone-900"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const open = openSections[section.id];
          const sectionDone = section.tasks.every((t) => taskState[t.id]?.done);
          const sectionDoneCount = section.tasks.filter((t) => taskState[t.id]?.done).length;

          return (
            <section
              key={section.id}
              className={`rounded-2xl border overflow-hidden bg-white transition-colors ${
                sectionDone ? "border-emerald-300" : "border-stone-200"
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    sectionDone ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {sectionDone ? <Check size={18} strokeWidth={2.5} /> : <Icon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900">{section.title}</div>
                  <div className="text-[12px] text-stone-500">
                    {sectionDoneCount} of {section.tasks.length} tasks
                  </div>
                </div>
                {open ? (
                  <ChevronDown size={18} className="text-stone-400 shrink-0" />
                ) : (
                  <ChevronRight size={18} className="text-stone-400 shrink-0" />
                )}
              </button>

              {open && (
                <div className="border-t border-stone-100 divide-y divide-stone-100">
                  {section.tasks.map((task) => {
                    const state = taskState[task.id] || {};
                    return (
                      <TaskRow
                        key={task.id}
                        task={task}
                        state={state}
                        onToggle={() => toggleTask(task.id)}
                        onAddPhoto={(kind) =>
                          setPhotoModal({ taskId: task.id, taskText: task.text, kind })
                        }
                        onClearPhoto={(kind) => clearPhoto(task.id, kind)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {notes && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-[11px] tracking-widest uppercase text-amber-700 mb-1">Client notes</div>
            <div className="text-[13px] text-stone-800">{notes}</div>
          </div>
        )}

        {/* Completion card */}
        {allDone && !jobCompletedAt && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white mb-3">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              All tasks complete
            </div>
            <div className="text-[13px] text-stone-600 mt-1">Ready to finalize the job report.</div>
            <button
              onClick={handleComplete}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800"
            >
              <CheckCircle2 size={16} /> Mark job complete
            </button>
          </div>
        )}

        {jobCompletedAt && (
          <div className="rounded-2xl border border-stone-900 bg-stone-900 text-stone-50 p-6">
            <div className="text-[11px] tracking-widest uppercase text-stone-400">Job Complete</div>
            <div className="text-2xl mt-1 font-semibold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {client.name || "Client"} — {formatDate(jobCompletedAt)}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 text-center">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{allTasks.length}</div>
                <div className="text-[11px] uppercase tracking-widest text-stone-400">Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{photoCount}</div>
                <div className="text-[11px] uppercase tracking-widest text-stone-400">Photos</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{elapsed}</div>
                <div className="text-[11px] uppercase tracking-widest text-stone-400">Duration</div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-50 text-stone-900 text-sm font-medium hover:bg-white"
            >
              <Printer size={16} /> Generate job report
            </button>
          </div>
        )}
      </main>

      {/* Bottom summary bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[12px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <ClipboardCheck size={14} />
              <span className="tabular-nums font-medium">{doneCount}/{allTasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera size={14} />
              <span className="tabular-nums font-medium">{photoCount}</span>
            </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={!allDone || jobCompletedAt}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700 text-white text-sm font-medium disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-emerald-800"
          >
            <CheckCircle2 size={15} />
            {jobCompletedAt ? "Completed" : "Complete Job"}
          </button>
        </div>
      </nav>

      {/* Photo capture modal */}
      {photoModal && (
        <PhotoCaptureModal
          taskText={photoModal.taskText}
          kind={photoModal.kind}
          onSave={(dataUrl) => {
            savePhoto(photoModal.taskId, photoModal.kind, dataUrl);
            setPhotoModal(null);
          }}
          onClose={() => setPhotoModal(null)}
        />
      )}
    </div>
  );
}

function TaskRow({ task, state, onToggle, onAddPhoto, onClearPhoto }) {
  return (
    <div className={`p-4 ${state.done ? "bg-stone-50" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0"
          aria-label={state.done ? "Mark incomplete" : "Mark complete"}
        >
          {state.done ? (
            <CheckCircle2 size={22} className="text-emerald-600" strokeWidth={2} />
          ) : (
            <Circle size={22} className="text-stone-300 hover:text-stone-500" strokeWidth={1.75} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={onToggle} className="text-left block w-full">
            <span
              className={`text-[14px] leading-snug ${
                state.done ? "text-stone-400 line-through" : "text-stone-800"
              }`}
            >
              {task.text}
            </span>
          </button>

          {/* Photo row */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PhotoSlot
              kind="before"
              dataUrl={state.before}
              onCapture={() => onAddPhoto("before")}
              onClear={() => onClearPhoto("before")}
            />
            <PhotoSlot
              kind="after"
              dataUrl={state.after}
              onCapture={() => onAddPhoto("after")}
              onClear={() => onClearPhoto("after")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({ kind, dataUrl, onCapture, onClear }) {
  const label = kind === "before" ? "Before" : "After";
  const accent = kind === "before" ? "text-rose-600 border-rose-200 bg-rose-50" : "text-emerald-700 border-emerald-200 bg-emerald-50";

  if (dataUrl) {
    return (
      <div className="relative group rounded-lg overflow-hidden border border-stone-200 aspect-[4/3] bg-stone-100">
        <img src={dataUrl} alt={`${label} photo`} className="w-full h-full object-cover" />
        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold tracking-widest uppercase text-stone-800">
          {label}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onCapture}
            className="px-2.5 py-1 rounded-full bg-white text-stone-900 text-[11px] font-medium flex items-center gap-1"
          >
            <RefreshCw size={11} /> Retake
          </button>
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded-full bg-white text-rose-600 text-[11px] font-medium flex items-center gap-1"
          >
            <X size={11} /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onCapture}
      className={`aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${accent} hover:brightness-95`}
    >
      <Camera size={20} />
      <span className="text-[11px] font-semibold tracking-widest uppercase">{label}</span>
    </button>
  );
}

// Photo capture modal — uses camera input for mobile, file fallback for desktop
function PhotoCaptureModal({ taskText, kind, onSave, onClose }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      // Downscale to max 1600px to keep storage reasonable
      const dataUrl = await compressImage(file, 1600, 0.82);
      setPreview(dataUrl);
      setError(null);
    } catch (e) {
      setError("Couldn't read that image. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-3">
          <div>
            <div className={`text-[11px] tracking-widest uppercase ${kind === "before" ? "text-rose-600" : "text-emerald-700"}`}>
              {kind === "before" ? "Before Photo" : "After Photo"}
            </div>
            <div className="text-[14px] text-stone-800 mt-0.5 font-medium">{taskText}</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {preview ? (
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[4/3]">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="block aspect-[4/3] rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-stone-500">
              <Camera size={32} className="text-stone-500" />
              <span className="text-[13px] font-medium text-stone-700">Tap to open camera</span>
              <span className="text-[11px] text-stone-500">or choose from library</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          )}

          {error && <div className="mt-3 text-[12px] text-rose-600">{error}</div>}

          <div className="mt-4 flex items-center gap-2">
            {preview && (
              <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 text-sm font-medium hover:bg-stone-50 cursor-pointer">
                <RefreshCw size={14} /> Retake
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    setPreview(null);
                    handleFile(e.target.files?.[0]);
                  }}
                />
              </label>
            )}
            <button
              onClick={() => preview && onSave(preview)}
              disabled={!preview}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium disabled:bg-stone-300 hover:bg-stone-800"
            >
              <Check size={14} /> Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compress an image file to a JPEG data URL at max dimension + quality
async function compressImage(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = width > height ? maxDim / width : maxDim / height;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Live elapsed-time hook
function useElapsed(startDate, endDate) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (endDate) return;
    const id = setInterval(() => tick((n) => n + 1), 30000); // re-render every 30s
    return () => clearInterval(id);
  }, [endDate]);

  const end = endDate || new Date();
  const diffMs = end - startDate;
  const mins = Math.floor(diffMs / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
