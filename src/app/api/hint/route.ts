import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/genkit";

export async function POST(req: NextRequest) {
  try {
    const { enigmaTitle, enigmaText, stepNumber } = await req.json();

    if (!enigmaTitle || !enigmaText) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const { text } = await ai.generate(
      `Tu es le maître du jeu d'UrbanKey, un escape game urbain immersif à Meknès, Maroc.

Un joueur est bloqué à l'étape ${stepNumber} intitulée "${enigmaTitle}".

Voici l'énigme : "${enigmaText}"

Génère un indice mystérieux, poétique et atmosphérique qui l'aide à avancer sans révéler la réponse directement.
L'indice doit être en français, faire 1-2 phrases maximum, avoir un ton légèrement dramatique et évoquer le patrimoine de Meknès.
Ne commence pas par "Indice:" ou similaire. Commence directement par l'indice.`
    );

    return NextResponse.json({ hint: text });
  } catch (err) {
    console.error("Genkit hint error:", err);
    return NextResponse.json({ error: "Erreur de génération" }, { status: 500 });
  }
}
