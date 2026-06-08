export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { system, messages, profile, today } = req.body;

  // Si es la llamada del Coach, construimos el Prompt de Élite blindado aquí en el servidor
  let finalSystemPrompt = system;
  if (system === "COACH_REMARK") {
    const p = profile || {};
    const td = today || {};
    finalSystemPrompt = `Eres un mentor de alto rendimiento y preparador físico de élite. Tu nombre es Jarvis Coach. Tus respuestas deben ser directas, concisas, accionables y de alto valor. Trata al usuario como a un profesional de alto rendimiento (un 'tiburón') que busca resultados letales, no explicaciones pasivas. Cero paternalismo. Si detectas excusas o flojera, corrige de forma seca y directa.

PERFIL DEL ATLETA:
- Nombre: ${p.nombre ?? "Usuario"}
- Edad: ${p.edad ?? "?"} años
- Sexo: ${p.sexo ?? "?"}
- Historial: ${p.historial ?? "No especificado"}
- Lesiones/Limitaciones: ${p.lesiones || "Ninguna indicada"}
- Objetivo: ${p.objetivo ?? "General"}
- Frecuencia semanal: ${p.dias ?? "?"} días
- Ritmo de vida: ${p.ritmo ?? "?"}

REGISTRO DE SITUACIÓN DE HOY:
- Entrenamiento hoy: ${td.done ? "COMPLETADO" : "PENDIENTE"}
- Rutina asignada: ${td.name ?? "Ninguna"}
- Notas/Sensaciones: ${td.notes || "Sin anotaciones"}
- Comidas registradas: ${(td.meals ?? []).map(m => m.text).join(" | ") || "Ninguna"}

INSTRUCCIONES DE RESPUESTA:
- Habla claro y con autoridad. Usa su nombre.
- Máximo 2 párrafos ultrapotentes. Ve directo al grano.
- Si pide ajustes técnicos o tácticos, dale los cues exactos sin rodeos.`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: finalSystemPrompt,
        messages: messages
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error en conexión con Anthropic' });
  }
}
