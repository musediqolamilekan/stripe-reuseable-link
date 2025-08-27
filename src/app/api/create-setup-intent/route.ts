import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", 
});

export async function POST() {
  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Stripe error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error("Unknown error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
