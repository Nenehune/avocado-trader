import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

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

const STATUS_META = {
  accepted: { label: "Accepted", color: "#3E7C6F" },
  declined: { label: "Walked away", color: "#8F856C" },
};

function statusFor(trade, me) {
  if (trade.status === "accepted" || trade.status === "declined") return STATUS_META[trade.status];
  const myTurn = trade.to_user === me;
  return myTurn ? { label: "Your move", color: "#CC6E2A" } : { label: "Waiting", color: "#3E7C6F" };
}

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

function Field({ label, value, onChange, placeholder, inputMode, maxLength, autoFocus }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.sub, marginBottom: 8 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        inputMode={inputMode} maxLength={maxLength} autoFocus={autoFocus}
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

function AuthScreen() {
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const sendCode = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setSending(false);
    if (error) setError(error.message);
    else setStep("code");
  };

  const resendCode = async () => {
    if (sending) return;
    setSending(true);
    setError("");
    setResent(false);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setSending(false);
    if (error) setError(error.message);
    else setResent(true);
  };

  const verifyCode = async () => {
    if (!code.trim() || verifying) return;
    setVerifying(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setVerifying(false);
    if (error) setError(error.message);
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setResent(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "32px 24px 24px" }}>
      <Lockup />
      {step === "email" ? (
        <>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, letterSpacing: "-0.01em", color: C.ink, marginTop: 12, marginBottom: 6 }}>
            Sign in
          </div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.5, marginBottom: 24 }}>
            We'll email you an 8-digit code — no password needed.
          </div>
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
          {error && <div style={{ fontSize: 14, color: C.red, marginTop: -10, marginBottom: 16, lineHeight: 1.5 }}>{error}</div>}
          <Btn onClick={sendCode} style={{ opacity: sending ? 0.7 : 1 }}>{sending ? "Sending…" : "Send code"}</Btn>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, letterSpacing: "-0.01em", color: C.ink, marginTop: 12, marginBottom: 6 }}>
            Enter code
          </div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.5, marginBottom: 24 }}>
            We sent an 8-digit code to <strong>{email}</strong>.
          </div>
          <Field label="Code" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 8))} placeholder="12345678"
            inputMode="numeric" maxLength={8} autoFocus />
          {error && <div style={{ fontSize: 14, color: C.red, marginTop: -10, marginBottom: 16, lineHeight: 1.5 }}>{error}</div>}
          {resent && !error && <div style={{ fontSize: 14, color: C.teal, marginTop: -10, marginBottom: 16, lineHeight: 1.5 }}>Code resent.</div>}
          <Btn onClick={verifyCode} style={{ opacity: verifying ? 0.7 : 1 }}>{verifying ? "Verifying…" : "Verify"}</Btn>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button onClick={backToEmail}
              style={{ background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: 13.5, color: C.sub, cursor: "pointer", padding: "10px 0", minHeight: 44 }}>
              Change email
            </button>
            <button onClick={resendCode} disabled={sending}
              style={{ background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: 13.5, color: C.sub, cursor: "pointer", padding: "10px 0", minHeight: 44, opacity: sending ? 0.6 : 1 }}>
              Resend code
            </button>
          </div>
        </>
      )}
    </div>
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
  const [session, setSession] = useState(undefined);
  const [profiles, setProfiles] = useState([]);
  const [partnerId, setPartnerId] = useState(null);
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState({ name: "home", tab: "active" });
  const [draft, setDraft] = useState({ offering: "", want: "" });
  const [sweeping, setSweeping] = useState(null);

  const me = session?.user?.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  // make sure the signed-in user has a profile row, so others can see them in the partner picker
  useEffect(() => {
    if (!session?.user) return;
    supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      display_name: session.user.email?.split("@")[0] ?? "",
    });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!me) return;
    supabase.from("profiles").select("id, display_name, email").neq("id", me)
      .then(({ data }) => {
        setProfiles(data ?? []);
        setPartnerId((current) => current ?? data?.[0]?.id ?? null);
      });
  }, [me]);

  useEffect(() => {
    if (!me || !partnerId) { setTrades([]); return; }
    supabase.from("trades").select("*")
      .or(`and(from_user.eq.${me},to_user.eq.${partnerId}),and(from_user.eq.${partnerId},to_user.eq.${me})`)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTrades(data ?? []));
  }, [me, partnerId]);

  const partner = profiles.find((p) => p.id === partnerId);
  const active = trades.filter((t) => t.status === "waiting" || t.status === "your-move");
  const done = trades.filter((t) => t.status === "accepted" || t.status === "declined");
  const current = trades.find((t) => t.id === view.id);
  const applyUpdate = (row) => setTrades((ts) => ts.map((t) => (t.id === row.id ? row : t)));

  const sendNew = async () => {
    if (!draft.offering.trim() || !partnerId) return;
    const offering = draft.offering.trim();
    const want = draft.want.trim() || "Make me an offer";
    const { data } = await supabase.from("trades").insert({
      from_user: me, to_user: partnerId, offering, want, status: "waiting",
    }).select().single();
    if (data) {
      setTrades((ts) => [data, ...ts]);
      await supabase.from("trade_offers").insert({ trade_id: data.id, by_user: me, offering, want });
    }
    setDraft({ offering: "", want: "" });
    setView({ name: "home", tab: "active" });
  };
  const sendCounter = async () => {
    if (!current) return;
    const other = current.from_user === me ? current.to_user : current.from_user;
    const { data } = await supabase.from("trades")
      .update({ offering: draft.offering, want: draft.want, from_user: me, to_user: other })
      .eq("id", current.id).select().single();
    if (data) {
      applyUpdate(data);
      await supabase.from("trade_offers").insert({ trade_id: data.id, by_user: me, offering: data.offering, want: data.want });
    }
    setView({ name: "detail", id: current.id });
  };
  const finishSweep = async () => {
    const { data } = await supabase.from("trades").update({ status: "accepted" }).eq("id", sweeping).select().single();
    if (data) applyUpdate(data);
    setSweeping(null);
    setView({ name: "home", tab: "done" });
  };
  const walkAway = async () => {
    if (!current) return;
    const { data } = await supabase.from("trades").update({ status: "declined" }).eq("id", current.id).select().single();
    if (data) applyUpdate(data);
    setView({ name: "home", tab: "done" });
  };

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
        {session === undefined && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.sub, fontSize: 15 }}>Loading…</div>
        )}
        {session === null && <AuthScreen />}
        {session && (
          <>
            {view.name === "home" && (
              <Home tab={view.tab} setTab={(tab) => setView({ name: "home", tab })} active={active} done={done}
                me={me} profiles={profiles} partnerId={partnerId} setPartnerId={setPartnerId} partner={partner}
                open={(id) => setView({ name: "detail", id })}
                onNew={() => { setDraft({ offering: "", want: "" }); setView({ name: "new" }); }}
                onSignOut={() => supabase.auth.signOut()} />
            )}
            {view.name === "new" && (
              <Compose title="New trade" subtitle={partner ? `To ${partner.display_name || partner.email}` : ""} draft={draft} setDraft={setDraft} onSend={sendNew}
                onBack={() => setView({ name: "home", tab: "active" })} sendLabel={partner ? `Send to ${partner.display_name || partner.email}` : "Send"} />
            )}
            {view.name === "detail" && current && (
              <Detail trade={current} me={me} partnerName={partner?.display_name || partner?.email}
                sweeping={sweeping === current.id} onSweepDone={finishSweep}
                onAccept={() => setSweeping(current.id)}
                onCounter={() => { setDraft({ offering: current.offering, want: current.want }); setView({ name: "counter", id: current.id }); }}
                onWalk={walkAway}
                onBack={() => setView({ name: "home", tab: "active" })} />
            )}
            {view.name === "counter" && current && (
              <Compose title="Counter" draft={draft} setDraft={setDraft} onSend={sendCounter}
                onBack={() => setView({ name: "detail", id: current.id })} sendLabel="Send it back" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Home({ tab, setTab, active, done, me, profiles, partnerId, setPartnerId, partner, open, onNew, onSignOut }) {
  const list = tab === "active" ? active : done;
  const partnerName = partner?.display_name || partner?.email || "them";
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "32px 24px 24px" }}>
      <Lockup />

      <button onClick={onSignOut}
        style={{ alignSelf: "flex-end", background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: 13.5,
          color: C.sub, cursor: "pointer", padding: "4px 0", marginBottom: 4, minHeight: 44 }}>
        Sign out
      </button>

      {/* partner picker */}
      {profiles.length > 0 ? (
        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {profiles.map((p) => {
            const on = p.id === partnerId;
            return (
              <button key={p.id} onClick={() => setPartnerId(p.id)}
                style={{ flexShrink: 0, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 600, minHeight: 44,
                  padding: "9px 18px", borderRadius: 999, cursor: "pointer",
                  border: on ? "none" : `1.5px solid ${C.cardEdge}`,
                  background: on ? C.coral : "transparent", color: on ? "#F8F1DC" : C.sub }}>
                {p.display_name || p.email}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 14, color: C.sub, marginTop: 14, marginBottom: 20, lineHeight: 1.5 }}>
          No one else has signed in yet — once someone does, they'll show up here to trade with.
        </div>
      )}

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
        {list.length === 0 && <div style={{ textAlign: "center", color: C.sub, fontSize: 15, marginTop: 60, lineHeight: 1.5 }}>Nothing here with {partnerName} yet. Start a trade below.</div>}
        {list.map((t, i) => <TradeCard key={t.id} trade={t} onClick={() => open(t.id)} delay={i * 0.05} me={me} partnerName={partnerName} />)}
      </div>

      {partnerId && <Btn onClick={onNew} style={{ marginTop: 16 }}>+ New trade</Btn>}
    </div>
  );
}

function TradeCard({ trade, onClick, delay, me, partnerName }) {
  const s = statusFor(trade, me);
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{ background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 20, padding: "16px 20px", marginBottom: 12, cursor: "pointer", animation: `rise 0.35s ${delay}s ease backwards` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: s.color }}>
          {trade.status === "accepted" ? <MiniStripes /> : s.label}
        </div>
        <div style={{ fontSize: 13.5, color: C.sub }}>{partnerName}</div>
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

function Detail({ trade, me, partnerName, onAccept, onCounter, onWalk, onBack, sweeping, onSweepDone }) {
  const s = statusFor(trade, me);
  const isOpen = trade.status === "waiting" || trade.status === "your-move";
  const canAct = isOpen && trade.to_user === me;
  const [history, setHistory] = useState([]);

  useEffect(() => {
    supabase.from("trade_offers").select("*").eq("trade_id", trade.id).order("created_at", { ascending: true })
      .then(({ data }) => setHistory(data ?? []));
  }, [trade.id, trade.offering, trade.want, trade.status]);

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

      {history.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: C.sub, marginBottom: 8 }}>Haggling so far</div>
          {history.map((h, i) => (
            <div key={h.id} style={{ fontSize: 14, color: C.sub, padding: "7px 0", lineHeight: 1.5, borderBottom: i < history.length - 1 ? `1px solid ${C.cardEdge}` : "none" }}>
              <span style={{ color: h.by_user === me ? "#3E7C6F" : "#CC6E2A", fontWeight: 600 }}>{h.by_user === me ? "You" : partnerName}:</span> {h.offering} for {h.want}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {isOpen && (
        <>
          {!canAct && <div style={{ fontSize: 14, color: C.sub, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>{partnerName}'s move. Sit tight.</div>}
          {canAct && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={onAccept} color={C.teal}>Accept trade</Btn>
              <Btn onClick={onCounter} kind="ghost">Counter</Btn>
              <Btn onClick={onWalk} kind="quiet">Walk away</Btn>
            </div>
          )}
        </>
      )}

      {trade.status === "accepted" && <div style={{ textAlign: "center", fontSize: 15, color: "#3E7C6F", fontWeight: 600 }}>Deal sealed. It's on the record.</div>}
      {trade.status === "declined" && <div style={{ textAlign: "center", fontSize: 15, color: C.sub }}>Someone walked. No hard feelings.</div>}
    </div>
  );
}
