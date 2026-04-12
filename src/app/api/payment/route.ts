import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { questId, questTitle, amount, currency = "mad" } = await req.json();

    if (!questId || !amount) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // centimes
      currency,
      metadata: { questId, questTitle },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[Stripe]", err);
    return NextResponse.json({ error: "Erreur paiement" }, { status: 500 });
  }
}
