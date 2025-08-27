import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

export async function POST(req: Request) {
    try {
        const { email, company, paymentMethodId } = await req.json();
        let customer = (await stripe.customers.list({ email, limit: 1 })).data[0];
        if (!customer) {
            customer = await stripe.customers.create({
                email,
                name: company,
                metadata: { company },
            });
        }
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
        });
        await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Stripe error:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        console.error("Unknown error:", err);
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}
