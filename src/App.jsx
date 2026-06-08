import { useState, useEffect, useCallback } from "react";

const TODAY = new Date().toISOString().split("T")[0];
const DATE_DISPLAY = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" });

const ALL_HABITS_POOL = [
  { id: "agua", icon: "💧", label: "Agua (2L+)" },
  { id: "pro", icon: "🥩", label: "Proteína cubierta" },
  { id: "sleep", icon: "😴", label: "Dormir 7-8h" },
  { id: "pasos", icon: "👟", label: "Pasos diarios" },
  { id: "ducha", icon: "🧊", label: "Ducha fría" },
  { id: "movil", icon: "🔄", label: "Movilidad / Stretching" },
  { id: "meditar", icon: "🧘", label: "Foco / Meditación" }
];

const DAY_MAP = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const TODAY_DOW = DAY_MAP[new Date().getDay()];

const WORKOUTS = [
  { tag: "LUN", name: "PUSH — Pecho · Hombro · Tríceps", ex: [["Slow push-ups", "3 × 5–6", "Bajada 4s, pausa, sube controlado"], ["Incline push-ups", "3 × 5–6", "Pies elevados, pecho superior"], ["Pike push-ups", "3 × 5", "Cadera alta, hombros al frente"], ["Tricep dips", "3 × 6", "Bajada lenta 3s, codos atrás"]] },
  { tag: "MAR", name: "PULL — Espalda · Bíceps · Postura", ex: [["Australian Rows", "3 × 5–6", "Cuerpo rígido, escápulas al final"], ["Dead Hang", "3 × 20–30s", "Hombros activos, no pasivo"], ["Scapular Pulls", "3 × 6", "Solo escápulas, sin doblar codos"]] },
  { tag: "MIÉ", name: "ACTIVO — Movilidad · Recuperación", ex: [["Movilidad cadera", "2 × 60s", "90/90, sin forzar"], ["Movilidad torácica", "2 × 8", "Cat-cow + rotaciones"], ["Stretching", "10 min", "Sin rebotes, respiración lenta"]] },
  { tag: "JUE", name: "PIERNA + REHAB — Estabilidad · Glúteo", ex: [["Sentadilla controlada", "3 × 6", "Bajada 3s, rodilla alineada"], ["Step-ups", "3 × 5 c/l", "Control total, glúteo activo"], ["Glute bridge", "3 × 8", "Aprieta glúteo 2s arriba"]] },
  { tag: "VIE", name: "UPPER ESTÉTICO — Pump · Brazos", ex: [["Elevaciones laterales", "4 × 6–8", "Sube lento, baja más lento"], ["Press militar", "3 × 5–6", "Con mochila o tensión consciente"], ["Curl concentrado", "3 × 6", "Codo fijo, supinación arriba"]] },
  { tag: "SÁB", name: "ACTIVO LIBRE", ex: [["Moverse libre", "", "Esquí, caminar o deporte libre"]] },
  { tag: "DOM", name: "RESET — Recuperación", ex: [["Stretching completo", "15 min", "Todo el cuerpo, sin prisa"], ["Movilidad tobillo", "5 min", "Preparar semana"]] }
];

const SK = "jfit-v2";
function loadData() {
  try {
    const r = localStorage.getItem(SK);
    if (r) return JSON.parse(r).value ? JSON.parse(JSON.parse(r).value) : JSON.parse(r);
  } catch {}
  return { days: {}, wIdx: 0, profile: null };
}
function saveData(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} }
const dayOf = (data) => data?.days?.[TODAY] ?? { done: false, meals: [], habits: {}, notes: "" };

const C = { bg: "#07070f", surface: "#0b0b18", card: "#0f0f1f", bdr: "rgba(0,207,255,0.1)", accent: "#00cfff", green: "#00e87c", amber: "#ffc107", muted: "rgba(255,255,255,0.38)", dim: "rgba(255,255,255,0.06)" };

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ nombre: "", edad: "", sexo: "", historial: "", lesiones: "", objetivo: "", dias: "", ritmo: "", fallos: [], habitosElegidos: ["agua", "pro", "sleep"] });

  const toggleHabit = (id) => setForm(f => ({
    ...f,
    habitosElegidos: f.habitosElegidos.includes(id) ? f.habitosElegidos.filter(x => x !== id) : [...f.habitosElegidos, id]
  }));

  const next = () => setStep(s => s + 1);
  const canNext = () => {
    if (step === 1) return form.nombre && form.edad && form.sexo;
    if (step === 2) return form.historial;
    if (step === 3) return form.objetivo;
    if (step === 4) return form.dias && form.ritmo && form.habitosElegidos.length > 0;
    return true;
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#07070f", color: "#fff", fontFamily: "'Outfit', sans-serif", padding: "40px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;} button:disabled{opacity:0.3; cursor:not-allowed;}`}</style>
      
      {step === 0 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 72, color: "#00cfff", lineHeight: 1 }}>JARVIS</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#00e87c", letterSpacing: "3px", marginBottom: 20 }}>FIT</div>
          <p style={{ color: C.muted, marginBottom: 40 }}>Anamnesis de rendimiento de alto nivel. Define tu punto de partida.</p>
          <button onClick={next} style={{ width: "100%", padding: 16, background: "rgba(0,207,255,0.1)", border: "1px solid #00cfff", color: "#00cfff", fontFamily: "'Bebas Neue'", fontSize: 20, cursor: "pointer" }}>INICIAR EVALUACIÓN</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 30, marginBottom: 20 }}>01 / IDENTIDAD</h2>
          <input type="text" placeholder="Tu nombre" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} style={{ width:"100%", padding:14, background:C.card, border:`1px solid ${C.bdr}`, color:"#fff", marginBottom:10 }} />
          <input type="number" placeholder="Edad" value={form.edad} onChange={e=>setForm({...form, edad: e.target.value})} style={{ width:"100%", padding:14, background:C.card, border:`1px solid ${C.bdr}`, color:"#fff", marginBottom:20 }} />
          <div style={{ display:"flex", gap:10 }}>
            {["Hombre", "Mujer"].map(s => <button key={s} onClick={()=>setForm({...form, sexo:s})} style={{ flex:1, padding:12, background:form.sexo===s? "rgba(0,207,255,0.15)":C.card, border:`1px solid ${form.sexo===s? C.accent:C.bdr}`, color:"#fff" }}>{s}</button>)}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 30, marginBottom: 10 }}>02 / ANTECEDENTES</h2>
          <p style={{ fontSize:13, color:C.muted, marginBottom:15 }}>Historial deportivo y lesiones activas:</p>
          <textarea placeholder="Ej: Calistenia intermedia, esquí los findes..." value={form.historial} onChange={e=>setForm({...form, historial: e.target.value})} style={{ width:"100%", padding:12, background:C.card, border:`1px solid ${C.bdr}`, color:"#fff", height:80, resize:"none", marginBottom:10 }} />
          <textarea placeholder="Lesiones o dolores (Ej: Molestia en tobillo izquierdo)" value={form.lesiones} onChange={e=>setForm({...form, lesiones: e.target.value})} style={{ width:"100%", padding:12, background:C.card, border:`1px solid ${C.bdr}`, color:"#fff", height:60, resize:"none" }} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 30, marginBottom: 20 }}>03 / METAS</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { id: "recuperacion", label: "Recuperación" }, { id: "deporte", label: "Volver al Deporte" },
              { id: "definicion", label: "Estética / Core" }, { id: "masa", label: "Masa Muscular" }
            ].map(o => <button key={o.id} onClick={()=>setForm({...form, objetivo:o.id})} style={{ padding:15, background:form.objetivo===o.id? "rgba(0,232,124,0.1)":C.card, border:`1px solid ${form.objetivo===o.id? C.green:C.bdr}`, color:"#fff", textAlign:"left" }}>{o.label}</button>)}
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 26, marginBottom: 15 }}>04 / PLANIFICACIÓN Y HÁBITOS</h2>
          <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Días semanales de entreno:</p>
          <div style={{ display:"flex", gap:5, marginBottom:15 }}>
            {["3","4","5"].map(d => <button key={d} onClick={()=>setForm({...form, dias:d})} style={{ flex:1, padding:10, background:form.dias===d?"rgba(0,207,255,0.15)":C.card, border:`1px solid ${form.dias===d?C.accent:C.bdr}`, color:"#fff" }}>{d}</button>)}
          </div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Ritmo de vida actual:</p>
          <div style={{ display:"flex", gap:5, marginBottom:15 }}>
            {["activo","caotico"].map(r => <button key={r} onClick={()=>setForm({...form, ritmo:r})} style={{ flex:1, padding:10, background:form.ritmo===r?"rgba(0,207,255,0.15)":C.card, border:`1px solid ${form.ritmo===r?C.accent:C.bdr}`, color:"#fff", textTransform:"capitalize" }}>{r}</button>)}
          </div>
          <p style={{ fontSize:12, color:C.accent, fontWeight:600, marginBottom:8 }}>SELECCIONA TUS HÁBITOS CLAVE:</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, maxHeight:140, overflowY:"auto", padding:2 }}>
            {ALL_HABITS_POOL.map(h => {
              const active = form.habitosElegidos.includes(h.id);
              return <button key={h.id} onClick={()=>toggleHabit(h.id)} style={{ padding:8, fontSize:12, background:active?"rgba(0,232,124,0.08)":C.card, border:`1px solid ${active?C.green:C.bdr}`, color:"#fff", textAlign:"left", display:"flex", gap:6 }}><span>{h.icon}</span>{h.label}</button>;
            })}
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>⚡</div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: C.green }}>ANAMNESIS COMPLETADA</h2>
          <p style={{ color:C.muted, fontSize:14, marginBottom:30, lineHeight:1.6 }}>Tu entorno de alto rendimiento está listo. El único que te para eres tú.</p>
          <button onClick={finish} style={{ width: "100%", padding: 16, background: "rgba(0,232,124,0.15)", border: "1px solid #00e87c", color: "#00e87c", fontFamily: "'Bebas Neue'", fontSize: 20, cursor: "pointer" }}>ENTRAR AL SISTEMA</button>
        </div>
      )}

      {step > 0 && step < 5 && (
        <button onClick={next} disabled={!canNext()} style={{ width: "100%", marginTop: 25, padding: 14, background: canNext()?"rgba(0,207,255,0.12)":C.dim, border: `1px solid ${canNext()?C.accent:C.dim}`, color: canNext()?C.accent:C.muted, fontFamily: "'Bebas Neue'", fontSize: 18, cursor:"pointer" }}>SIGUIENTE →</button>
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
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => { setData(loadData()); }, []);

  const handleOnboardingComplete = (profile) => {
    setData(prev => { const next = { ...prev, profile }; saveData(next); return next; });
  };

  const mutate = useCallback((patch) => {
    setData(prev => { const next = { ...prev, days: { ...prev.days, [TODAY]: { ...dayOf(prev), ...patch } } }; saveData(next); return next; });
  }, []);

  const toggleWorkout = useCallback(() => {
    setData(prev => {
      const td = dayOf(prev); const wasDone = td.done;
      const next = { ...prev, days: { ...prev.days, [TODAY]: { ...td, done: !wasDone } } };
      saveData(next); return next;
    });
  }, []);

  const validateFood = async () => {
    if (!food.trim() || aiState === "loading") return;
    setAiState("loading"); setFeedback(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "Eres nutricionista deportivo de élite. Evalúa comida de forma ultra concisa. Responde SOLO JSON puro: {\"ok\":true,\"emoji\":\"✅\",\"msg\":\"máx 6 palabras\",\"pro\":\"alta\",\"carbs\":\"medios\"}",
          messages: [{ role: "user", content: food.trim() }]
        })
      });
      const json = await res.json();
      const raw = json.content?.[0]?.text ?? "{}";
      const p = JSON.parse(raw.replace(/```json?|```/g, "").trim());
      setFeedback(p);
      mutate({ meals: [...(dayOf(data).meals ?? []), { text: food.trim(), t: new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"}), ...p }] });
      setFood(""); setAiState("done"); setTimeout(() => setAiState("idle"), 2000);
    } catch {
      setFeedback({ emoji: "❌", msg: "Error de conexión." }); setAiState("error"); setTimeout(() => setAiState("idle"), 2000);
    }
  };

  const sendCoach = async () => {
    if (!coachInput.trim() || coachLoading) return;
    const userMsg = coachInput.trim(); setCoachInput("");
    const updated = [...coachMessages, { role: "user", content: userMsg }];
    setCoachMessages(updated); setCoachLoading(true);

    const p = data.profile ?? {}; const td = dayOf(data);
    const userHabitsList = ALL_HABITS_POOL.filter(h => p.habitosElegidos?.includes(h.id));

    const systemPrompt = `Eres Jarvis Coach, mentor estratégico y preparador físico de Jan Salvat. Tono directo, seco, de alto valor, cero paternalismo. Si el atleta mete excusas de pececillo, sácale los dientes. Respuestas de máximo 2 párrafos ultra letales.
Atleta: ${p.nombre}. Edad: ${p.edad}. Historial: ${p.historial}. Lesiones: ${p.lesiones}. Meta: ${p.objetivo}. Días: ${p.dias}. Ritmo: ${p.ritmo}.
Hoy: Entreno: ${td.done?'COMPLETADO':'PENDIENTE'}. Notas: ${td.notes || 'Ninguna'}. Comidas: ${(td.meals??[]).map(m=>m.text).join(' | ') || 'Ninguna'}. Hábitos elegidos activos: ${userHabitsList.map(h => `${h.label}: ${td.habits?.[h.id]?'✓':'✗'}`).join(' | ')}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, messages: updated.map(m=>({role:m.role, content:m.content})) })
      });
      const json = await res.json();
      setCoachMessages(prev => [...prev, { role: "assistant", content: json.content?.[0]?.text ?? "Error al procesar respuesta." }]);
    } catch {
      setCoachMessages(prev => [...prev, { role: "assistant", content: "Error en red. Reintenta." }]);
    }
    setCoachLoading(false);
  };

  if (!data) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:C.bg, color:C.accent, fontFamily:"monospace" }}>INICIANDO...</div>;
  if (!data.profile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const td = dayOf(data);
  const workout = WORKOUTS.find(w => w.tag === TODAY_DOW) ?? WORKOUTS[0];
  const userHabits = ALL_HABITS_POOL.filter(h => data.profile.habitosElegidos?.includes(h.id));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "'Outfit', sans-serif", paddingBottom: 80 }}>
      <header style={{ padding: 15, background: C.surface, borderBottom: `1px solid ${C.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily:"'DM Mono'", fontSize:10, color:C.accent, letterSpacing:"3px" }}>JARVIS · FIT</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{DATE_DISPLAY} · {data.profile?.nombre}</div>
        </div>
      </header>

      <main style={{ padding: "10px 16px" }}>
        {tab === "hoy" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp 0.2s" }}>
            <button onClick={toggleWorkout} style={{ width:"100%", padding:16, borderRadius:10, background:td.done?"rgba(0,232,124,0.06)":C.card, border:`1px solid ${td.done?C.green:C.bdr}`, textStyle:"left", color:"#fff", cursor:"pointer" }}>
              <div style={{ fontSize:16, fontWeight:600, color:td.done?C.green:"#fff" }}>{td.done?"✓ ENTRANAMIENTO HECHO":"MARCAR ENTRENAMIENTO HOY"}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Hoy toca: {workout.name}</div>
            </button>

            <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.bdr}`, overflow:"hidden" }}>
              <div style={{ padding:12, borderBottom:`1px solid ${C.dim}`, fontSize:13, fontFamily:"'Bebas Neue'", color:C.accent }}>MIS HÁBITOS DE ANAMNESIS</div>
              {userHabits.map(h => {
                const done = !!td.habits?.[h.id];
                return (
                  <button key={h.id} onClick={()=>mutate({ habits: { ...td.habits, [h.id]: !done } })} style={{ width:"100%", display:"flex", alignItems:"center", justifyStyle:"space-between", padding:12, background:"none", border:"none", borderBottom:`1px solid ${C.dim}`, color:"#fff", cursor:"pointer" }}>
                    <span style={{ marginRight:10 }}>{h.icon}</span>
                    <span style={{ flex:1, textAlign:"left", fontSize:13 }}>{h.label}</span>
                    <div style={{ width:18, height:18, border:`1px solid ${done?C.green:C.muted}`, background:done?C.green:"transparent", display:"flex", alignItems:"center", justifyContent: "center", fontSize:10 }}>{done&&"✓"}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ background:C.card, padding:12, borderRadius:10, border:`1px solid ${C.bdr}` }}>
              <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>SENSACIONES DEL DÍA</div>
              <textarea value={td.notes??""} onChange={e=>mutate({notes:e.target.value})} placeholder="Energía, dolores o foco hoy..." rows={2} style={{ width:"100%", background:"none", border:"none", color:"#fff", fontSize:13, outline:"none", resize:"none" }} />
            </div>
          </div>
        )}

        {tab === "entreno" && (
          <div style={{ animation:"fadeUp 0.2s" }}>
            <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:28, color:C.accent, marginBottom:2 }}>{workout.tag}</h2>
            <p style={{ fontSize:14, fontWeight:600, marginBottom:15 }}>{workout.name}</p>
            {workout.ex.map(([name, sets, note], i) => (
              <div key={i} style={{ background:C.card, padding:12, borderRadius:8, border:`1px solid ${C.bdr}`, marginBottom:8 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{i+1}. {name}</div>
                <div style={{ fontSize:12, color:C.green, fontFamily:"'DM Mono'", marginTop:4 }}>{sets} <span style={{ color:C.muted }}>· {note}</span></div>
              </div>
            ))}
          </div>
        )}

        {tab === "comida" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeUp 0.2s" }}>
            <div style={{ background:C.card, padding:14, borderRadius:10, border:`1px solid ${C.bdr}` }}>
              <textarea value={food} onChange={e=>setFood(e.target.value)} placeholder="Ej: 200g de pavo + arroz..." rows={2} style={{ width:"100%", padding:10, background:C.dim, color:"#fff", border:`1px solid ${C.bdr}`, outline:"none", resize:"none", marginBottom:10 }} />
              <button onClick={validateFood} disabled={aiState==="loading"} style={{ width:"100%", padding:12, background:"rgba(0,207,255,0.1)", border:`1px solid ${C.accent}`, color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer" }}>{aiState==="loading"?"ANALIZANDO...":"VALIDAR COMIDA CON IA"}</button>
              {feedback && <div style={{ marginTop:10, padding:10, background:C.dim, border:`1px solid ${C.bdr}`, fontSize:13, display:"flex", gap:8 }}><span>{feedback.emoji}</span><div><strong>{feedback.msg}</strong>{feedback.pro && <div style={{ fontSize:11, color:C.muted }}>P: {feedback.pro} | C: {feedback.carbs}</div>}</div></div>}
            </div>
            {[...(td.meals??[])].reverse().map((m,i)=> <div key={i} style={{ padding:10, background:C.card, borderRadius:8, border:`1px solid ${C.bdr}`, fontSize:13, display:"flex", justifyStyle:"space-between" }}><span style={{ marginRight:8 }}>{m.emoji||"🍽️"}</span><span style={{ flex:1 }}>{m.text} - <small style={{color:C.green}}>{m.msg}</small></span><span style={{ color:C.muted, fontSize:10 }}>{m.t}</span></div>)}
          </div>
        )}

        {tab === "coach" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 150px)", animation:"fadeUp 0.2s" }}>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:10 }}>
              {coachMessages.length === 0 && <div style={{ background:C.card, padding:14, border:`1px solid ${C.bdr}`, color:C.muted, fontSize:13 }}>Jarvis Coach activo y conectado. Tengo tu anamnesis. Exige rendimiento o pide ajustes tácticos. Sin excusas.</div>}
              {coachMessages.map((m,i)=> <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}><div style={{ maxWidth:"85%", padding:12, borderRadius:10, background:m.role==="user"?"rgba(0,207,255,0.12)":C.card, border:`1px solid ${m.role === 'user' ? 'rgba(0,207,255,0.2)' : C.bdr}`, fontSize:13, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{m.content}</div></div>)}
              {coachLoading && <div style={{ color:C.muted, fontSize:12, fontFamily:"monospace" }}>JARVIS ANALIZANDO...</div>}
            </div>
            <div style={{ display:"flex", gap:8, paddingTop:5 }}>
              <textarea value={coachInput} onChange={e=>setCoachInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(); sendCoach();}}} placeholder="Mensaje al Coach..." rows={1} style={{ flex:1, padding:12, background:C.card, border:`1px solid ${C.bdr}`, color:"#fff", fontSize:13, outline:"none", resize:"none" }} />
              <button onClick={sendCoach} disabled={coachLoading||!coachInput.trim()} style={{ width:45, background:"rgba(0,207,255,0.1)", border:`1px solid ${C.accent}`, color:C.accent, cursor:"pointer" }}>↑</button>
            </div>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.bdr}`, display: "flex", zIndex: 100 }}>
        {[
          { id: "hoy", icon: "⚡", label: "HOY" }, { id: "entreno", icon: "💪", label: "ENTRENO" },
          { id: "comida", icon: "🍽️", label: "COMIDA" }, { id: "coach", icon: "🧠", label: "COACH" }
        ].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", background: "none", border: "none", borderTop: `2px solid ${tab === t.id ? C.accent : "transparent"}`, color: tab === t.id ? C.accent : C.muted, fontSize: 10, cursor:"pointer" }}><span style={{ fontSize: 16 }}>{t.icon}</span><span>{t.label}</span></button>)}
      </nav>
    </div>
  );
}
