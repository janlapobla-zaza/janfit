import { useState, useEffect, useCallback } from "react";

const TODAY = new Date().toISOString().split("T")[0];
const DATE_DISPLAY = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" });

const HABITS = [
  { id: "agua", icon: "💧", label: "Agua (2L+)" },
  { id: "pro", icon: "🥩", label: "Proteína cubierta" },
  { id: "sleep", icon: "😴", label: "Dormí bien" },
  { id: "ducha", icon: "🧊", label: "Ducha fría" },
  { id: "movil", icon: "🔄", label: "Movilidad / stretching" },
];

const DAY_MAP = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const TODAY_DOW = DAY_MAP[new Date().getDay()];

const WORKOUTS = [
  { tag: "LUN", name: "PUSH — Pecho · Hombro · Tríceps", ex: [
    ["Slow push-ups", "3 × 5–6", "Bajada 4s, pausa abajo, sube controlado"],
    ["Incline push-ups", "3 × 5–6", "Pies elevados, pecho superior, sin colapsar"],
    ["Pike push-ups", "3 × 5", "Cadera alta, hombros al frente, tensión consciente"],
    ["Tricep dips (silla)", "3 × 6", "Bajada lenta 3s, codos atrás sin abrirse"],
    ["Diamond push-ups", "3 × 5", "Codos pegados, siente el tríceps en cada rep"],
    ["Hollow hold (borde cama)", "3 × 20s", "Retroversión, esconder cola, respiración corta"],
    ["Rehab tobillo", "2 min", "Tibialis raises + equilibrio monopodal"],
  ]},
  { tag: "MAR", name: "PULL — Espalda · Bíceps · Postura", ex: [
    ["Australian Rows", "3 × 5–6", "Cuerpo rígido, escápulas al final, bajada lenta"],
    ["Dead Hang", "3 × 20–30s", "Hombros activos, no pasivo, respira"],
    ["Scapular Pulls", "3 × 6", "Solo escápulas, sin doblar codos"],
    ["Remo con mochila", "3 × 5 c/l", "Codo 90° arriba, pausa arriba 1s"],
    ["Face pulls (toalla)", "3 × 8", "Deltoide posterior, control escapular total"],
    ["Curl martillo", "3 × 6", "Tensión lenta, sin balanceo, siente el bíceps"],
    ["Core ligero", "2 × 20s", "Dead bug o bird dog, sin prisa"],
  ]},
  { tag: "MIÉ", name: "ACTIVO — Movilidad · Recuperación", ex: [
    ["Movilidad cadera", "2 × 60s c/l", "90/90, círculos, sin forzar"],
    ["Movilidad torácica", "2 × 8", "Cat-cow + rotaciones lentas"],
    ["Core técnico", "3 × 20s", "Dead bug o bird dog, control respiratorio"],
    ["Rehab tobillo", "5 min", "Propiocepción + movilidad completa"],
    ["Stretching", "10 min", "Sin rebotes, respiración lenta, disfruta"],
  ]},
  { tag: "JUE", name: "PIERNA + REHAB — Estabilidad · Glúteo", ex: [
    ["Sentadilla controlada", "3 × 6", "Bajada 3s, rodilla alineada, talón pegado"],
    ["Step-ups", "3 × 5 c/l", "Control total, no impulso, glúteo activo"],
    ["Glute bridge", "3 × 8", "Aprieta glúteo 2s arriba, sin acelerar"],
    ["Calf raise", "3 × 8", "Lento, rango completo, tobillo estable"],
    ["Tibialis raises", "3 × 10", "Contra pared, punta arriba controlada"],
    ["Balance unilateral", "3 × 30s", "Progresivo, ojos cerrados si puedes"],
    ["Hollow hold", "3 × 20s", "Core profundo, retroversión activa"],
  ]},
  { tag: "VIE", name: "UPPER ESTÉTICO — Pump · Hombros · Brazos", ex: [
    ["Elevaciones laterales", "4 × 6–8", "Sin impulso, sube lento, baja más lento"],
    ["Press militar (mochila)", "3 × 5–6", "Tensión consciente, hombros 3D"],
    ["Slow push-ups explosivas", "3 × 5", "Bajada 3s, subida potente controlada"],
    ["Curl concentrado", "3 × 6", "Codo fijo, supinación arriba, pausa 1s"],
    ["Hollow hold progresivo", "3 × 25s", "Cada semana unos segundos más"],
    ["Postura final", "5 min", "Pecho abierto, escápulas abajo, respira"],
  ]},
  { tag: "SÁB", name: "ACTIVO LIBRE", ex: [
    ["Caminar, esquí, movilidad o deporte libre", "", "Sin estructura. Muévete y disfruta."],
  ]},
  { tag: "DOM", name: "RESET — Recuperación", ex: [
    ["Stretching completo", "15 min", "Todo el cuerpo, sin prisa"],
    ["Movilidad tobillo", "5 min", "Preparar semana"],
    ["Respiración / mindfulness", "5 min", "Reset mental y físico"],
  ]},
];

const PARK_WORKOUT = [
  ["Australian Rows (barra baja)", "3 × 5–6", "Cuerpo rígido, escápulas al final"],
  ["Dead Hang", "3 × 20–30s", "Hombros activos, respira, descomprime"],
  ["Scapular Pulls", "3 × 6", "Solo escápulas, sin doblar codos"],
  ["Monkey Bars suaves", "2 pasadas", "Control, sin balanceo, tranquilo"],
  ["Push-ups lentas", "3 × 5", "Bajada 4s, pausa, sube controlado"],
  ["Step-ups (banco)", "3 × 5 c/l", "Glúteo activo, sin impulso"],
  ["Balance unilateral", "3 × 30s", "Tobillo fuerte, ojos cerrados si puedes"],
  ["Tibialis Raises", "3 × 10", "Contra pared o bordillo"],
  ["Hollow Hold progresivo", "3 × 20s", "Retroversión, respiración corta"],
];

const SK = "jfit-v2";

function loadData() {
  try {
    const r = localStorage.getItem(SK);
    if (r) {
      const parsed = JSON.parse(r);
      return parsed.value ? JSON.parse(parsed.value) : parsed;
    }
  } catch {}
  return { days: {}, wIdx: 0, profile: null };
}

function saveData(d) {
  try { localStorage.setItem(SK, JSON.stringify(d)); } catch {}
}

const dayOf = (data) => data?.days?.[TODAY] ?? { done: false, meals: [], habits: {}, notes: "" };

function calcStreak(data) {
  if (!data || !data.days) return 0;
  const d = new Date(); let s = 0;
  for (let i = 0; i < 365; i++) {
    const k = d.toISOString().split("T")[0];
    if (!data.days?.[k]?.done) break;
    s++; d.setDate(d.getDate() - 1);
  }
  return s;
}

function weekDots(data) {
  const d = new Date(), dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, () => {
    const k = d.toISOString().split("T")[0];
    const dot = { k, done: !!data?.days?.[k]?.done, isToday: k === TODAY, label: d.toLocaleDateString("es", { weekday: "short" })[0].toUpperCase() };
    d.setDate(d.getDate() + 1);
    return dot;
  });
}

const C = {
  bg: "#07070f", surface: "#0b0b18", card: "#0f0f1f",
  bdr: "rgba(0,207,255,0.1)", accent: "#00cfff", green: "#00e87c",
  amber: "#ffc107", muted: "rgba(255,255,255,0.38)", dim: "rgba(255,255,255,0.06)",
};

// ─── ONBOARDING / ANAMNESIS ───────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: "", edad: "", sexo: "",
    historial: "", lesiones: "",
    objetivo: "", dias: "",
    ritmo: "", fallos: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleFallo = (id) => setForm(f => ({
    ...f,
    fallos: f.fallos.includes(id) ? f.fallos.filter(x => x !== id) : [...f.fallos, id]
  }));

  const next = () => setStep(s => s + 1);
  const canNext = () => {
    if (step === 1) return form.nombre && form.edad && form.sexo;
    if (step === 2) return form.historial;
    if (step === 3) return form.objetivo;
    if (step === 4) return form.dias && form.ritmo;
    return true;
  };

  const finish = () => onComplete(form);

  const inp = (placeholder, key, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,207,255,0.15)", borderRadius: 10, padding: "13px 14px", color: "#fff", fontSize: 15, outline: "none", fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}
    />
  );

  const progress = step / 5;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#07070f", color: "#fff", fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input::placeholder{color:rgba(255,255,255,0.25);} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {step > 0 && step < 5 && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.05)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress * 100}%`, background: "#00cfff", transition: "width 0.4s ease", borderRadius: 2 }} />
        </div>
      )}

      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.3s ease" }} key={step}>

        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 72, color: "#00cfff", lineHeight: 1, marginBottom: 8 }}>JARVIS</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#00e87c", letterSpacing: "3px", marginBottom: 28 }}>FIT</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 12 }}>
              Antes de entrenar, necesito conocerte.
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.7, marginBottom: 40 }}>
              No soy una app genérica. Cuanto más honesto seas,<br/>más preciso será tu sistema.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginBottom: 48 }}>
              "El primer paso es ser honesto contigo mismo."
            </div>
            <button onClick={next} style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(0,207,255,0.12)", border: "1px solid #00cfff", color: "#00cfff", fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: "3px", cursor: "pointer" }}>
              EMPEZAR
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#00cfff", letterSpacing: "4px", marginBottom: 8 }}>01 / QUIÉN ERES</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, lineHeight: 1.1, marginBottom: 6 }}>HÁBLAME DE TI</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>Solo lo esencial. Sin rollos.</div>
            {inp("Tu nombre", "nombre")}
            {inp("Edad", "edad", "number")}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["Hombre", "Mujer", "Otro"].map(s => (
                <button key={s} onClick={() => set("sexo", s)} style={{ flex: 1, padding: "13px 8px", borderRadius: 10, background: form.sexo === s ? "rgba(0,207,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.sexo === s ? "#00cfff" : "rgba(255,255,255,0.1)"}`, color: form.sexo === s ? "#00cfff" : "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#00cfff", letterSpacing: "4px", marginBottom: 8 }}>02 / DE DÓNDE VIENES</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, lineHeight: 1.1, marginBottom: 6 }}>TU HISTORIAL</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>Sin pelos en la lengua. La honestidad es el primer cambio.</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.5px" }}>¿De dónde vienes físicamente?</div>
            <textarea
              placeholder="Ej: jugué al fútbol de pequeño, luego nada durante 3 años, ahora quiero retomar..."
              value={form.historial}
              onChange={e => set("historial", e.target.value)}
              rows={3}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,207,255,0.15)", borderRadius: 10, padding: "13px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", resize: "none", marginBottom: 16, lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.5px" }}>Lesiones u operaciones relevantes (opcional)</div>
            <textarea
              placeholder="Ej: esguince tobillo izquierdo, operación rodilla en 2021..."
              value={form.lesiones}
              onChange={e => set("lesiones", e.target.value)}
              rows={2}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,207,255,0.15)", borderRadius: 10, padding: "13px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", resize: "none", lineHeight: 1.6 }}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#00cfff", letterSpacing: "4px", marginBottom: 8 }}>03 / A DÓNDE VAS</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, lineHeight: 1.1, marginBottom: 6 }}>TU OBJETIVO</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 24 }}>Aunque sea vago. El sistema se adapta.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { id: "recuperacion", icon: "🩹", label: "Recuperación muscular" },
                { id: "deporte", icon: "⛷️", label: "Volver al deporte" },
                { id: "definicion", icon: "🔥", label: "Definición y estética" },
                { id: "masa", icon: "💪", label: "Ganar masa muscular" },
                { id: "bajar", icon: "⚡", label: "Perder peso" },
                { id: "rendimiento", icon: "🏆", label: "Rendimiento general" },
              ].map(o => (
                <button key={o.id} onClick={() => set("objetivo", o.id)} style={{ padding: "14px 12px", borderRadius: 12, background: form.objetivo === o.id ? "rgba(0,232,124,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.objetivo === o.id ? "#00e87c" : "rgba(255,255,255,0.08)"}`, color: form.objetivo === o.id ? "#00e87c" : "rgba(255,255,255,0.6)", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{o.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{o.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#00cfff", letterSpacing: "4px", marginBottom: 8 }}>04 / TU RITMO</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, lineHeight: 1.1, marginBottom: 6 }}>CÓMO ES TU VIDA</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 20 }}>La adherencia empieza por ser realista.</div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.5px" }}>Días que puedes entrenar de verdad</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["2","3","4","5","6"].map(d => (
                <button key={d} onClick={() => set("dias", d)} style={{ flex: 1, padding: "12px 4px", borderRadius: 10, background: form.dias === d ? "rgba(0,207,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.dias === d ? "#00cfff" : "rgba(255,255,255,0.1)"}`, color: form.dias === d ? "#00cfff" : "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
                  {d}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.5px" }}>Tu ritmo de vida</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { id: "tranquilo", icon: "🌿", label: "Tranquilo", sub: "Días ordenados, poco estrés" },
                { id: "activo", icon: "⚡", label: "Activo", sub: "Siempre en movement, productivo" },
                { id: "caotico", icon: "🌪️", label: "Caótico", sub: "Horarios irregulares, mucha variación" },
              ].map(r => (
                <button key={r.id} onClick={() => set("ritmo", r.id)} style={{ padding: "14px 16px", borderRadius: 12, background: form.ritmo === r.id ? "rgba(0,207,255,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.ritmo === r.id ? "#00cfff" : "rgba(255,255,255,0.08)"}`, color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, transition: "all 0.18s" }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: form.ritmo === r.id ? "#00cfff" : "#fff" }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{r.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.5px" }}>¿Por qué has fallado antes?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { id: "tiempo", label: "Falta de tiempo" },
                { id: "motivacion", label: "Pérdida de motivación" },
                { id: "lesion", label: "Lesiones" },
                { id: "nosabia", label: "No sabía qué hacer" },
                { id: "primera", label: "Es mi primera vez" },
                { id: "rutina", label: "No encontré una rutina que me encajara" },
              ].map(f => (
                <button key={f.id} onClick={() => toggleFallo(f.id)} style={{ padding: "9px 14px", borderRadius: 20, background: form.fallos.includes(f.id) ? "rgba(255,193,7,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.fallos.includes(f.id) ? "#ffc107" : "rgba(255,255,255,0.1)"}`, color: form.fallos.includes(f.id) ? "#ffc107" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", transition: "all 0.18s" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔥</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: "#00e87c", marginBottom: 8 }}>LISTO, {form.nombre.toUpperCase()}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 12 }}>
              Tu perfil está creado. El sistema ya te conoce.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: 48, fontStyle: "italic" }}>
              A partir de aquí, cada entreno es tuyo.<br />El único que puede pararte eres tú.
            </div>
            <button onClick={finish} style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(0,232,124,0.12)", border: "1px solid #00e87c", color: "#00e87c", fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: "3px", cursor: "pointer" }}>
              EMPEZAR A ENTRENAR
            </button>
          </div>
        )}

      </div>

      {step > 0 && step < 5 && (
        <div style={{ padding: "16px 20px 28px" }}>
          <button onClick={next} disabled={!canNext()} style={{ width: "100%", padding: "15px", borderRadius: 12, background: canNext() ? "rgba(0,207,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${canNext() ? "#00cfff" : "rgba(255,255,255,0.08)"}`, color: canNext() ? "#00cfff" : "rgba(255,255,255,0.2)", fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: "2px", cursor: canNext() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
            {step === 4 ? "VER MI PERFIL" : "CONTINUAR →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("hoy");
  const [data, setData] = useState(null);
  const [food, setFood] = useState("");
  const [aiState, setAiState] = useState("idle");
  const [feedback, setFeedback] = useState(null);
  const [flash, setFlash] = useState(false);
  const [parkMode, setParkMode] = useState(false);
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => { 
    setData(loadData()); 
  }, []);

  const handleOnboardingComplete = (profile) => {
    setData(prev => {
      const next = { ...prev, profile };
      saveData(next);
      return next;
    });
  };

  const mutate = useCallback((patch) => {
    setData(prev => {
      const next = { ...prev, days: { ...prev.days, [TODAY]: { ...dayOf(prev), ...patch } } };
      saveData(next);
      return next;
    });
  }, []);

  const toggleWorkout = useCallback(() => {
    setData(prev => {
      const td = dayOf(prev);
      const wasDone = td.done;
      const next = wasDone
        ? { ...prev, days: { ...prev.days, [TODAY]: { ...td, done: false } } }
        : { ...prev, days: { ...prev.days, [TODAY]: { ...td, done: true } } };
      saveData(next);
      if (!wasDone) { setFlash(true); setTimeout(() => setFlash(false), 1000); }
      return next;
    });
  }, []);

  const validateFood = async () => {
    if (!food.trim() || aiState === "loading") return;
    const snap = food.trim();
    setAiState("loading"); setFeedback(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "dangerouslyAllowBrowser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: "Eres un nutricionista deportivo de alto rendimiento. Analiza con precisión técnica lo que come el usuario. Responde SÓLO con JSON válido, sin bloques de código, sin texto adicional.",
          messages: [{ role: "user", content: `Evalúa para atleta con físico atlético funcional: "${snap}"\nJSON esperado: {"ok":true,"emoji":"✅","msg":"frase concisa max 8 palabras","pro":"alta","carbs":"medios"}` }],
        })
      });
      const json = await res.json();
      const raw = json.content?.[0]?.text ?? "{}";
      const parsedFeedback = JSON.parse(raw.replace(/```json?|```/g, "").trim());
      const t = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
      setFeedback(parsedFeedback);
      setData(prev => {
        const td = dayOf(prev);
        const next = { ...prev, days: { ...prev.days, [TODAY]: { ...td, meals: [...(td.meals ?? []), { text: snap, t, ...parsedFeedback }] } } };
        saveData(next);
        return next;
      });
      setFood("");
      setAiState("done");
      setTimeout(() => setAiState("idle"), 2800);
    } catch {
      setFeedback({ emoji: "❌", msg: "Error. Intenta de nuevo." });
      setAiState("error");
      setTimeout(() => setAiState("idle"), 2200);
    }
  };

  const sendCoach = async () => {
    if (!coachInput.trim() || coachLoading) return;
    const userMsg = coachInput.trim();
    setCoachInput("");
    
    const updatedMessages = [...coachMessages, { role: "user", content: userMsg }];
    setCoachMessages(updatedMessages);
    setCoachLoading(true);

    const p = data.profile ?? {};
    const todayData = dayOf(data);
    const workout = WORKOUTS.find(w => w.tag === TODAY_DOW) ?? WORKOUTS[0];
    const objetivoLabel = {
      recuperacion: "Recuperación muscular", deporte: "Volver al deporte",
      definicion: "Definición y estética", masa: "Ganar masa muscular",
      bajar: "Perder peso", rendimiento: "Rendimiento general"
    }[p.objetivo] ?? p.objetivo ?? "No especificado";

    const systemPrompt = `Eres un mentor de alto rendimiento y preparador físico de élite. Tu nombre es Jarvis Coach. Tus respuestas deben ser directas, concisas, accionables y de alto valor. Trata al usuario como a un profesional de alto rendimiento que busca resultados letales, no explicaciones pasivas.

PERFIL DEL ATLETA:
- Nombre: ${p.nombre ?? "Usuario"}
- Edad: ${p.edad ?? "?"} años
- Sexo: ${p.sexo ?? "?"}
- Historial: ${p.historial ?? "No especificado"}
- Lesiones/Limitaciones: ${p.lesiones || "Ninguna indicada"}
- Objetivo Estratégico: ${objetivoLabel}
- Frecuencia semanal: ${p.dias ?? "?"} días
- Ritmo de vida: ${p.ritmo ?? "?"}

REGISTRO DE HOY (${TODAY} — ${TODAY_DOW}):
- Estado del entrenamiento: ${todayData.done ? "COMPLETADO" : "PENDIENTE"}
- Rutina asignada hoy: ${workout?.name ?? "Ninguna"}
- Nutrición registrada: ${(todayData.meals ?? []).map(m => m.text).join(" | ") || "Sin registrar"}
- Notas/Sensaciones: ${todayData.notes || "Sin anotaciones"}
- Hábitos cubiertos: Agua ${todayData.habits?.agua ? "✓" : "✗"} | Proteína ${todayData.habits?.pro ? "✓" : "✗"} | Sueño ${todayData.habits?.sleep ? "✓" : "✗"} | Ducha fría ${todayData.habits?.ducha ? "✓" : "✗"} | Movilidad ${todayData.habits?.movil ? "✓" : "✗"}

FILOSOFÍA DE EJECUCIÓN:
- Execution perfecta > volumen basura.
- Cero paternalismo. Si detectas justificaciones o mentalidad débil, corrige de forma directa y seca.
- Enfoque radical en consistencia y escalabilidad física.

INSTRUCCIONES DE RESPUESTA:
- Habla claro y con autoridad. Usa su nombre.
- Máximo 2-3 párrafos ultrapotentes. Ve directo al grano.
- Si pide ajustes técnicos, dale los "cues" exactos sin rodeos.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "dangerouslyAllowBrowser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        })
      });
      const json = await res.json();
      const reply = json.content?.[0]?.text ?? "Error al procesar la respuesta del Coach.";
      setCoachMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setCoachMessages(prev => [...prev, { role: "assistant", content: "Error de red al conectar con Jarvis Coach. Reintenta." }]);
    }
    setCoachLoading(false);
  };

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg }}>
      <div style={{ color: C.accent, fontFamily: "monospace", letterSpacing: "5px", fontSize: 11, animation: "pulse 1.4s infinite" }}>
        INICIANDO...
      </div>
    </div>
  );

  if (!data.profile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const td = dayOf(data);
  const streak = calcStreak(data);
  const workout = WORKOUTS.find(w => w.tag === TODAY_DOW) ?? WORKOUTS[0];
  const dots = weekDots(data);
  const totalSessions = Object.values(data.days ?? {}).filter(d => d.done).length;
  const doneHabits = HABITS.filter(h => td.habits?.[h.id]).length;
  const navItems = [
    { id: "hoy", icon: "⚡", label: "HOY" },
    { id: "entreno", icon: "💪", label: "ENTRENO" },
    { id: "comida", icon: "🍽️", label: "COMIDA" },
    { id: "coach", icon: "🧠", label: "COACH" },
    { id: "stats", icon: "📊", label: "STATS" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; }
        textarea, button { font-family: 'Outfit', sans-serif; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,207,255,0.15); border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px rgba(0,232,124,0.1); } 50% { box-shadow:0 0 55px rgba(0,232,124,0.55); } }
        .fade { animation: fadeUp 0.26s ease both; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "'Outfit', sans-serif", paddingBottom: 74 }}>

        <header style={{ padding: "18px 20px 14px", background: C.surface, borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: C.accent, letterSpacing: "4px" }}>JARVIS · FIT</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3, textTransform: "capitalize" }}>{DATE_DISPLAY} · {data.profile?.nombre ?? ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, lineHeight: 1, color: streak > 0 ? C.accent : C.muted }}>{streak}</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: "2px" }}>RACHA</div>
            </div>
          </div>
        </header>

        <main style={{ padding: "0 16px" }}>

          {tab === "hoy" && (
            <div className="fade" style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={toggleWorkout} style={{ width: "100%", padding: "18px 20px", borderRadius: 14, background: td.done ? "rgba(0,232,124,0.07)" : C.card, border: `1px solid ${td.done ? C.green : C.bdr}`, cursor: "pointer", transition: "all 0.25s", textAlign: "left", animation: flash ? "glow 0.7s ease" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: td.done ? "rgba(0,232,124,0.2)" : C.dim, border: `1px solid ${td.done ? C.green : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "all 0.25s" }}>
                    {td.done ? "✓" : "○"}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: "1px", color: td.done ? C.green : "#fff" }}>
                      {td.done ? "ENTRENO COMPLETADO" : "MARCAR ENTRENO"}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {td.done ? `✓ ${workout.tag} — ${workout.name}` : `Hoy: ${workout.tag} — ${workout.name}`}
                    </div>
                  </div>
                </div>
              </button>

              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", borderBottom: `1px solid ${C.dim}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: "1.5px", color: C.accent }}>HÁBITOS HOY</span>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: doneHabits === HABITS.length ? C.green : C.muted }}>{doneHabits}/{HABITS.length}</span>
                </div>
                {HABITS.map((h, i) => {
                  const done = !!td.habits?.[h.id];
                  return (
                    <button key={h.id} onClick={() => mutate({ habits: { ...td.habits, [h.id]: !done } })} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "none", border: "none", borderBottom: i < HABITS.length - 1 ? `1px solid ${C.dim}` : "none", cursor: "pointer", color: done ? "#fff" : C.muted, transition: "color 0.18s" }}>
                      <span style={{ fontSize: 17 }}>{h.icon}</span>
                      <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: done ? 500 : 400 }}>{h.label}</span>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: done ? C.green : "transparent", border: `1.5px solid ${done ? C.green : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, transition: "all 0.18s" }}>
                        {done && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: (td.meals?.length ?? 0) > 0 ? 10 : 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: "1.5px", color: C.accent }}>COMIDAS HOY</span>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: C.muted }}>{td.meals?.length ?? 0} reg.</span>
                </div>
                {(td.meals?.length ?? 0) > 0
                  ? td.meals.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: `1px solid ${C.dim}` }}>
                      <span style={{ fontSize: 16 }}>{m.emoji || "🍽️"}</span>
                      <span style={{ flex: 1, fontSize: 13 }}>{m.text}</span>
                      <span style={{ fontFamily: "'DM Mono'", fontSize: 10, color: C.muted }}>{m.t}</span>
                    </div>
                  ))
                  : <div style={{ fontSize: 13, color: C.muted, paddingTop: 2 }}>Sin comidas aún — ve a Comida ↗</div>
                }
              </div>

              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: C.muted, letterSpacing: "1px", marginBottom: 8 }}>SENSACIONES DEL DÍA</div>
                <textarea value={td.notes ?? ""} onChange={e => mutate({ notes: e.target.value })} placeholder="Energía, ánimo, notas rápidas..." rows={2} style={{ width: "100%", background: "none", border: "none", color: "#fff", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "'Outfit'" }} />
              </div>
            </div>
          )}

          {tab === "entreno" && (
            <div className="fade" style={{ paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button onClick={() => setParkMode(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: !parkMode ? "rgba(0,207,255,0.12)" : C.dim, border: `1px solid ${!parkMode ? C.accent : "transparent"}`, color: !parkMode ? C.accent : C.muted, fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.2s" }}>
                  🏠 CASA
                </button>
                <button onClick={() => setParkMode(true)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: parkMode ? "rgba(0,232,124,0.1)" : C.dim, border: `1px solid ${parkMode ? C.green : "transparent"}`, color: parkMode ? C.green : C.muted, fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.2s" }}>
                  🌳 PARQUE
                </button>
              </div>

              {!parkMode ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 56, color: C.accent, lineHeight: 1 }}>{workout.tag}</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: "0.5px" }}>{workout.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>6 reps perfectas &gt; 12 descontroladas</div>
                    </div>
                  </div>
                  {workout.ex.map(([name, sets, note], i) => (
                    <div key={i} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.bdr}`, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 14 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: C.accent, minWidth: 22, lineHeight: 1.1 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: C.green, background: "rgba(0,232,124,0.1)", padding: "2px 9px", borderRadius: 5 }}>{sets}</span>
                          <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>{note}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 56, color: C.green, lineHeight: 1 }}>🌳</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: "0.5px" }}>PARK MODE — CALISTENIA</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Termina activado, no destruido</div>
                    </div>
                  </div>
                  {PARK_WORKOUT.map(([name, sets, note], i) => (
                    <div key={i} style={{ background: C.card, borderRadius: 12, border: `1px solid rgba(0,232,124,0.12)`, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 14 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: C.green, minWidth: 22, lineHeight: 1.1 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {sets && <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: C.green, background: "rgba(0,232,124,0.1)", padding: "2px 9px", borderRadius: 5 }}>{sets}</span>}
                          <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>{note}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <button onClick={toggleWorkout} style={{ width: "100%", marginTop: 4, marginBottom: 10, padding: "15px", borderRadius: 12, background: td.done ? "rgba(0,232,124,0.08)" : "rgba(0,207,255,0.1)", border: `1px solid ${td.done ? C.green : C.accent}`, color: td.done ? C.green : C.accent, fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: "2px", cursor: "pointer" }}>
                {td.done ? "✓ COMPLETADO — DESMARCAR" : "MARCAR COMO COMPLETADO"}
              </button>
            </div>
          )}

          {tab === "comida" && (
            <div className="fade" style={{ paddingTop: 14 }}>
              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: 16, marginBottom: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: C.accent, letterSpacing: "1.5px", marginBottom: 12 }}>REGISTRAR COMIDA</div>
                <textarea value={food} onChange={e => setFood(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); validateFood(); } }} placeholder="ej: 200g arroz + 150g pollo plancha + brócoli..." rows={2} style={{ width: "100%", background: C.dim, border: `1px solid ${C.bdr}`, borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, resize: "none", outline: "none", lineHeight: 1.5, marginBottom: 10 }} />
                <button onClick={validateFood} disabled={aiState === "loading"} style={{ width: "100%", padding: "13px", borderRadius: 9, background: aiState === "done" ? "rgba(0,232,124,0.12)" : aiState === "loading" ? C.dim : "rgba(0,207,255,0.12)", border: `1px solid ${aiState === "done" ? C.green : aiState === "loading" ? C.bdr : C.accent}`, color: aiState === "done" ? C.green : aiState === "loading" ? C.muted : C.accent, fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: "2px", cursor: aiState === "loading" ? "not-allowed" : "pointer", animation: aiState === "loading" ? "pulse 1.2s infinite" : "none", transition: "all 0.2s" }}>
                  {aiState === "loading" ? "ANALIZANDO..." : aiState === "done" ? "✓ REGISTRADO" : "VALIDAR CON IA"}
                </button>
                {feedback && (
                  <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: feedback.ok !== false ? "rgba(0,232,124,0.07)" : "rgba(255,193,7,0.07)", border: `1px solid ${feedback.ok !== false ? "rgba(0,232,124,0.25)" : "rgba(255,193,7,0.25)"}`, display: "flex", gap: 12, alignItems: "center", animation: "fadeUp 0.3s ease" }}>
                    <span style={{ fontSize: 26 }}>{feedback.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: feedback.ok !== false ? C.green : C.amber }}>{feedback.msg}</div>
                      {feedback.pro && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Proteína: {feedback.pro} · Carbs: {feedback.carbs}</div>}
                    </div>
                  </div>
                )}
              </div>

              {(td.meals?.length ?? 0) > 0 && (
                <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, overflow: "hidden" }}>
                  <div style={{ padding: "11px 16px", borderBottom: `1px solid ${C.dim}` }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: "1.5px", color: C.accent }}>HISTORIAL DE HOY</span>
                  </div>
                  {[...td.meals].reverse().map((m, i) => (
                    <div key={i} style={{ padding: "12px 16px", borderBottom: i < td.meals.length - 1 ? `1px solid ${C.dim}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 19, flexShrink: 0 }}>{m.emoji || "🍽️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.text}</div>
                        {m.msg && <div style={{ fontSize: 12, color: m.ok !== false ? C.green : m.ok === false ? C.amber : "#fff", marginTop: 2 }}>{m.msg}</div>}
                      </div>
                      <span style={{ fontFamily: "'DM Mono'", fontSize: 10, color: C.muted, flexShrink: 0, paddingTop: 2 }}>{m.t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "coach" && (
            <div className="fade" style={{ paddingTop: 14, display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>

              {coachMessages.length === 0 && (
                <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "18px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,207,255,0.12)", border: `1px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🧠</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: C.accent, letterSpacing: "1px", marginBottom: 4 }}>JARVIS COACH</div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                        Hola {data.profile?.nombre ?? ""}. Tengo tu perfil completo. Cuéntame cómo estás, qué no entiendes o qué quieres ajustar hoy.
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      "¿Cómo hago bien las Australian Rows?",
                      "Hoy me siento con poca energía",
                      "Adapta el entreno de hoy",
                      "¿Qué como antes de entrenar?",
                    ].map(q => (
                      <button key={q} onClick={() => { setCoachInput(q); }} style={{ padding: "8px 12px", borderRadius: 20, background: C.dim, border: `1px solid ${C.bdr}`, color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
                {coachMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "85%", padding: "12px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "rgba(0,207,255,0.12)" : C.card, border: `1px solid ${m.role === "user" ? "rgba(0,207,255,0.3)" : C.bdr}`, fontSize: 14, lineHeight: 1.6, color: m.role === "user" ? C.accent : "#fff", whiteSpace: "pre-wrap" }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {coachLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", background: C.card, border: `1px solid ${C.bdr}`, animation: "pulse 1.2s infinite" }}>
                      <span style={{ color: C.muted, fontSize: 13, letterSpacing: "3px" }}>...</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: 8, display: "flex", gap: 8 }}>
                <textarea
                  value={coachInput}
                  onChange={e => setCoachInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendCoach(); } }}
                  placeholder="Pregunta, cuéntame o pídeme que adapte algo..."
                  rows={2}
                  style={{ flex: 1, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "11px 13px", color: "#fff", fontSize: 14, resize: "none", outline: "none", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}
                />
                <button onClick={sendCoach} disabled={coachLoading || !coachInput.trim()} style={{ width: 46, borderRadius: 10, background: coachInput.trim() ? "rgba(0,207,255,0.15)" : C.dim, border: `1px solid ${coachInput.trim() ? C.accent : "transparent"}`, color: coachInput.trim() ? C.accent : C.muted, fontSize: 20, cursor: coachInput.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "all 0.18s" }}>
                  ↑
                </button>
              </div>
            </div>
          )}

          {tab === "stats" && (
            <div className="fade" style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "RACHA ACTUAL", value: streak, color: C.accent },
                  { label: "TOTAL ENTRENOS", value: totalSessions, color: C.green },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "18px 16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 54, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: "2px", marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: C.accent, letterSpacing: "1.5px", marginBottom: 14 }}>ESTA SEMANA</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                  {dots.map(d => (
                    <div key={d.k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                      <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: d.isToday ? C.accent : C.muted }}>{d.label}</div>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: d.done ? "rgba(0,232,124,0.18)" : d.isToday ? "rgba(0,207,255,0.07)" : C.dim, border: `1.5px solid ${d.done ? C.green : d.isToday ? C.accent : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: d.done ? C.green : "transparent", transition: "all 0.2s" }}>
                        {d.done ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: C.accent, letterSpacing: "1.5px", marginBottom: 8 }}>FOTO DE PROGRESO</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                  📸 Cada 2 semanas — misma hora, misma luz, mismo ángulo.<br />
                  Frontal + lateral + espaldas.
                </div>
                {totalSessions >= 1 && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,207,255,0.05)", borderRadius: 9, border: `1px solid ${C.bdr}`, fontSize: 13 }}>
                    <span style={{ color: C.accent, fontWeight: 600 }}>{totalSessions}</span> {totalSessions === 1 ? "sesión" : "sesiones"} completadas. El físico se construye en silencio.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.bdr}`, display: "flex", zIndex: 100 }}>
          {navItems.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "8px 0 10px", cursor: "pointer", background: "none", border: "none", borderTop: `2px solid ${tab === t.id ? C.accent : "transparent"}`, color: tab === t.id ? C.accent : C.muted, transition: "color 0.18s", fontSize: 10, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              <span style={{ fontSize: 19 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </>
  );
}
