import { useState, useEffect } from "react";

// ============================================================
// AVOCADO TRADER — Supergraphic (refined)
// Home: big AVO/CADO lockup + stripe ribbon. After home: quiet,
// content-forward screens. Warm cream. Tight type, 8pt rhythm.
// ============================================================

const C = {
  bg: "#EFE5C7",
  card: "#F8F1DC",
  cardEdge: "#E1D4AC",
  ink: "#25404C",       // deep navy-teal
  sub: "#6E634C",       // warm gray, legible on cream
  shadow: "#4B8578",    // teal offset behind the wordmark
  red: "#C24D2C",
  coral: "#D96C47",
  orange: "#E1913C",
  mustard: "#D9B44A",
  teal: "#4B8578",
  navy: "#25404C",
};
const BAND = [C.red, C.orange, C.mustard, C.teal, C.navy];

// ---------- stripe ribbon (threads off the wordmark, sweeps up-right) ----------
function Ribbon({ style }) {
  const s = 7, g = 2.5;
  return (
    <svg width="100%" height="150" viewBox="0 0 400 150" preserveAspectRatio="none" style={{ display: "block", ...style }} aria-hidden="true">
      {BAND.map((c, i) => {
        const o = i * (s + g);
        return (
          <path
            key={c}
            d={`M -20 ${104 + o} C 90 ${118 + o}, 210 ${40 + o}, 430 ${6 + o}`}
            stroke={c}
            strokeWidth={s}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function MiniStripes({ w = 38 }) {
  const s = 3.2;
  return (
    <svg width={w} height={BAND.length * (s + 1.4)} aria-label="Accepted">
      {BAND.map((color, i) => (
        <rect key={color} x="0" y={i * (s + 1.4)} width={w} height={s} rx={s / 2} fill={color} />
      ))}
    </svg>
  );
}

// ---------- the big lockup ----------
function Lockup() {
  return (
    <div style={{ position: "relative", marginBottom: 6 }}>
      <Ribbon style={{ position: "absolute", top: -6, left: 0, zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <StackWord text="AVO" />
        <StackWord text="CADO" mt={-14} />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 600, letterSpacing: "0.36em", fontSize: 15, color: C.sub, textTransform: "uppercase" }}>Trader</span>
      </div>
    </div>
  );
}

// stacked word with a teal offset shadow
function StackWord({ text, mt = 0 }) {
  const base = { fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 62, lineHeight: 0.86, letterSpacing: "-0.02em" };
  return (
    <div style={{ position: "relative", height: 54, marginTop: mt }}>
      <span style={{ ...base, position: "absolute", left: 3, top: 4, color: C.shadow, opacity: 0.55 }}>{text}</span>
      <span style={{ ...base, position: "relative", color: C.ink }}>{text}</span>
    </div>
  );
}

const PARTNERS = ["Sis", "Mom", "Theo"];

const seed = [
  { id: 1, partner: "Sis", offering: "2 avocados", want: "One (1) sincere compliment", status: "waiting",
    history: [{ by: "you", offering: "2 avocados", want: "One (1) sincere compliment" }] },
  { id: 2, partner: "Sis", offering: "Half a sandwich", want: "The good parking spot, Saturday only", status: "your-move",
    history: [
      { by: "you", offering: "Half a sandwich", want: "The good parking spot" },
      { by: "Sis", offering: "Half a sandwich", want: "The good parking spot, Saturday only" },
    ] },
  { id: 3, partner: "Sis", offering: "I do bedtime tonight", want: "You do dishes", status: "accepted",
    history: [{ by: "you", offering: "I do bedtime tonight", want: "You do dishes" }] },
  { id: 4, partner: "Mom", offering: "Rake the leaves", want: "Your lasagna recipe (for real this time)", status: "your-move",
    history: [{ by: "Mom", offering: "Rake the leaves", want: "Your lasagna recipe (for real this time)" }] },
  { id: 5, partner: "Theo", offering: "My good headphones, 1 week", want: "You feed the cat while I'm gone", status: "waiting",
    history: [{ by: "you", offering: "My good headphones, 1 week", want: "You feed the cat while I'm gone" }] },
];

const STATUS = {
  "your-move": { label: "Your move", color: "#CC6E2A" },
  waiting: { label: "Waiting", color: "#3E7C6F" },
  accepted: { label: "Accepted", color: "#3E7C6F" },
  declined: { label: "Walked away", color: "#8F856C" },
};

function Btn({ children, onClick, kind = "solid", color = C.coral, textColor = "#F8F1DC", style }) {
  const base = { fontFamily: "'Jost', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: "0.02em",
    minHeight: 50, padding: "13px 18px", borderRadius: 999, cursor: "pointer", border: "none", transition: "transform 0.08s ease", width: "100%" };
  const kinds = {
    solid: { background: color, color: textColor },
    ghost: { background: "transparent", color: C.ink, border: `1.5px solid ${C.cardEdge}` },
    quiet: { background: "transparent", color: C.sub },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...kinds[kind], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.sub, marginBottom: 8 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: "'Jost', sans-serif", fontSize: 17, minHeight: 50,
          color: C.ink, background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 14, padding: "13px 16px", outline: "none" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = C.orange)}
        onBlur={(e) => (e.currentTarget.style.borderColor = C.cardEdge)} />
    </div>
  );
}

// small quiet wordmark for non-home screens
function MiniWord() {
  return (
    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 19, letterSpacing: "-0.01em", color: C.ink }}>Avocado Trader</span>
  );
}

function Sweep({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1350); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20, pointerEvents: "none" }}>
      {BAND.map((color, i) => (
        <div key={color} style={{ position: "absolute", top: `${i * 20}%`, left: 0, height: "20.5%", width: "100%", background: color,
          transform: "translateX(-105%)", animation: `sweep 0.9s ${i * 0.07}s cubic-bezier(0.7,0,0.2,1) forwards` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, animation: "pop 0.45s 0.55s ease forwards" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: "#F8F1DC" }}>Deal.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [trades, setTrades] = useState(seed);
  const [view, setView] = useState({ name: "home", tab: "active" });
  const [draft, setDraft] = useState({ offering: "", want: "" });
  const [sweeping, setSweeping] = useState(null);
  const [demoSide, setDemoSide] = useState(false);
  const [partner, setPartner] = useState(PARTNERS[0]);

  const mine = trades.filter((t) => t.partner === partner);
  const active = mine.filter((t) => t.status === "your-move" || t.status === "waiting");
  const done = mine.filter((t) => t.status === "accepted" || t.status === "declined");
  const current = trades.find((t) => t.id === view.id);
  const update = (id, patch) => setTrades((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const sendNew = () => {
    if (!draft.offering.trim()) return;
    const t = { id: Date.now(), partner, offering: draft.offering.trim(), want: draft.want.trim() || "Make me an offer",
      status: "waiting", history: [{ by: "you", offering: draft.offering.trim(), want: draft.want.trim() || "Make me an offer" }] };
    setTrades((ts) => [t, ...ts]); setDraft({ offering: "", want: "" }); setView({ name: "home", tab: "active" });
  };
  const sendCounter = () => {
    if (!current) return;
    const by = demoSide ? current.partner : "you";
    update(current.id, { offering: draft.offering, want: draft.want, status: demoSide ? "your-move" : "waiting",
      history: [...current.history, { by, offering: draft.offering, want: draft.want }] });
    setView({ name: "detail", id: current.id });
  };
  const finishSweep = () => { update(sweeping, { status: "accepted" }); setSweeping(null); setView({ name: "home", tab: "done" }); };

  return (
    <div style={{ minHeight: "100vh", background: "#DDD1B0", display: "flex", justifyContent: "center", padding: "24px 12px", fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,900&family=Jost:wght@400;500;600;700&display=swap');
        @keyframes sweep { to { transform: translateX(0); } }
        @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
        input::placeholder { color: #A99D82; }
        button:focus-visible, input:focus-visible, [role="button"]:focus-visible { outline: 3px solid ${C.orange}; outline-offset: 2px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400, background: C.bg, borderRadius: 28, position: "relative", overflow: "hidden",
        boxShadow: "0 12px 40px rgba(37,64,76,0.18)", display: "flex", flexDirection: "column", minHeight: 720 }}>
        {view.name === "home" && (
          <Home tab={view.tab} setTab={(tab) => setView({ name: "home", tab })} active={active} done={done}
            partner={partner} setPartner={setPartner}
            open={(id) => setView({ name: "detail", id })}
            onNew={() => { setDraft({ offering: "", want: "" }); setView({ name: "new" }); }} />
        )}
        {view.name === "new" && (
          <Compose title="New trade" subtitle={`To ${partner}`} draft={draft} setDraft={setDraft} onSend={sendNew}
            onBack={() => setView({ name: "home", tab: "active" })} sendLabel={`Send to ${partner}`} />
        )}
        {view.name === "detail" && current && (
          <Detail trade={current} sweeping={sweeping === current.id} onSweepDone={finishSweep}
            onAccept={() => setSweeping(current.id)}
            onCounter={() => { setDraft({ offering: current.offering, want: current.want }); setView({ name: "counter", id: current.id }); }}
            onWalk={() => { update(current.id, { status: "declined" }); setView({ name: "home", tab: "done" }); }}
            onBack={() => setView({ name: "home", tab: "active" })} demoSide={demoSide} setDemoSide={setDemoSide} />
        )}
        {view.name === "counter" && current && (
          <Compose title={demoSide ? `Counter as ${current.partner}` : "Counter"} draft={draft} setDraft={setDraft} onSend={sendCounter}
            onBack={() => setView({ name: "detail", id: current.id })} sendLabel="Send it back" />
        )}
      </div>
    </div>
  );
}

function Home({ tab, setTab, active, done, partner, setPartner, open, onNew }) {
  const list = tab === "active" ? active : done;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "32px 24px 24px" }}>
      <Lockup />

      {/* partner picker */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {PARTNERS.map((p) => {
          const on = p === partner;
          return (
            <button key={p} onClick={() => setPartner(p)}
              style={{ flexShrink: 0, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 600, minHeight: 44,
                padding: "9px 18px", borderRadius: 999, cursor: "pointer",
                border: on ? "none" : `1.5px solid ${C.cardEdge}`,
                background: on ? C.coral : "transparent", color: on ? "#F8F1DC" : C.sub }}>
              {p}
            </button>
          );
        })}
        <button aria-label="Add partner"
          style={{ flexShrink: 0, fontFamily: "'Jost', sans-serif", fontSize: 20, fontWeight: 500, minHeight: 44, minWidth: 44,
            padding: "0 4px", borderRadius: 999, cursor: "pointer", border: `1.5px dashed ${C.cardEdge}`, background: "transparent", color: C.sub }}>
          +
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["active", "done"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 600, minHeight: 44, padding: "10px 22px",
              borderRadius: 999, border: "none", cursor: "pointer",
              background: tab === t ? C.ink : "transparent", color: tab === t ? "#F8F1DC" : C.sub, textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {list.length === 0 && <div style={{ textAlign: "center", color: C.sub, fontSize: 15, marginTop: 60, lineHeight: 1.5 }}>Nothing here with {partner} yet. Start a trade below.</div>}
        {list.map((t, i) => <TradeCard key={t.id} trade={t} onClick={() => open(t.id)} delay={i * 0.05} />)}
      </div>

      <Btn onClick={onNew} style={{ marginTop: 16 }}>+ New trade</Btn>
    </div>
  );
}

function TradeCard({ trade, onClick, delay }) {
  const s = STATUS[trade.status];
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{ background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 20, padding: "16px 20px", marginBottom: 12, cursor: "pointer", animation: `rise 0.35s ${delay}s ease backwards` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: s.color }}>
          {trade.status === "accepted" ? <MiniStripes /> : s.label}
        </div>
        <div style={{ fontSize: 13.5, color: C.sub }}>{trade.partner}</div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: C.ink, marginBottom: 3, lineHeight: 1.4 }}>{trade.offering}</div>
      <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.4 }}>for {trade.want}</div>
    </div>
  );
}

function Compose({ title, subtitle, draft, setDraft, onSend, onBack, sendLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px 24px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: 15, color: C.sub, cursor: "pointer", padding: "10px 10px 10px 0", minHeight: 44 }}>← Back</button>
        <MiniWord />
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 900, letterSpacing: "-0.01em", color: C.ink, marginBottom: subtitle ? 4 : 28 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.coral, marginBottom: 28 }}>{subtitle}</div>}
      <Field label="You offer" value={draft.offering} onChange={(v) => setDraft((d) => ({ ...d, offering: v }))} placeholder="2 avocados" />
      <Field label="You want" value={draft.want} onChange={(v) => setDraft((d) => ({ ...d, want: v }))} placeholder="Leave blank for “make me an offer”" />
      <div style={{ flex: 1 }} />
      <Btn onClick={onSend}>{sendLabel}</Btn>
    </div>
  );
}

function Detail({ trade, onAccept, onCounter, onWalk, onBack, sweeping, onSweepDone, demoSide, setDemoSide }) {
  const s = STATUS[trade.status];
  const isOpen = trade.status === "your-move" || trade.status === "waiting";
  const canAct = trade.status === "your-move" || demoSide;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px 24px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: 15, color: C.sub, cursor: "pointer", padding: "10px 10px 10px 0", minHeight: 44 }}>← Back</button>
        <MiniWord />
      </div>

      <div style={{ position: "relative", background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 20, padding: "26px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: s.color, marginBottom: 18 }}>
          {trade.status === "accepted" ? <MiniStripes w={46} /> : s.label}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: C.sub, marginBottom: 5 }}>On the table</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 18, lineHeight: 1.3 }}>{trade.offering}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: C.sub, marginBottom: 5 }}>In exchange for</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{trade.want}</div>
        {sweeping && <Sweep onDone={onSweepDone} />}
      </div>

      {trade.history.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: C.sub, marginBottom: 8 }}>Haggling so far</div>
          {trade.history.map((h, i) => (
            <div key={i} style={{ fontSize: 14, color: C.sub, padding: "7px 0", lineHeight: 1.5, borderBottom: i < trade.history.length - 1 ? `1px solid ${C.cardEdge}` : "none" }}>
              <span style={{ color: h.by === "you" ? "#3E7C6F" : "#CC6E2A", fontWeight: 600 }}>{h.by === "you" ? "You" : "Sis"}:</span> {h.offering} for {h.want}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {isOpen && (
        <>
          {!canAct && <div style={{ fontSize: 14, color: C.sub, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>Sis's move. Sit tight — or flip the demo switch below to answer as her.</div>}
          {canAct && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={onAccept} color={C.teal}>Accept trade</Btn>
              <Btn onClick={onCounter} kind="ghost">Counter</Btn>
              <Btn onClick={onWalk} kind="quiet">Walk away</Btn>
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13.5, color: C.sub, cursor: "pointer", justifyContent: "center", minHeight: 44 }}>
            <input type="checkbox" checked={demoSide} onChange={(e) => setDemoSide(e.target.checked)} style={{ width: 18, height: 18 }} />
            Demo: act as Sis
          </label>
        </>
      )}

      {trade.status === "accepted" && <div style={{ textAlign: "center", fontSize: 15, color: "#3E7C6F", fontWeight: 600 }}>Deal sealed. It's on the record.</div>}
      {trade.status === "declined" && <div style={{ textAlign: "center", fontSize: 15, color: C.sub }}>Someone walked. No hard feelings.</div>}
    </div>
  );
}
