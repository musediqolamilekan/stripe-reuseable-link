import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // use real supported version
});

export async function POST(req: Request) {
  try {
    const { email, company } = await req.json();

    // 1. Find or create customer
    let customer = (await stripe.customers.list({ email, limit: 1 })).data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        name: company,
        metadata: { company },
      });
    }

    // 2. Create SetupIntent linked to customer (saves card, no charge)
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
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
