// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
// @ts-ignore
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

// @ts-ignore
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

console.log("Stripe Checkout Function Initialized")

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { price_id, user_id, return_url } = await req.json()

        // 1. Get or Create Stripe Customer
        const supabaseClient = createClient(
            // @ts-ignore
            Deno.env.get('SUPABASE_URL') ?? '',
            // @ts-ignore
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user_id)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile?.email,
                metadata: { user_id: user_id }
            })
            customerId = customer.id
            // Update profile
            await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user_id)
        }

        // 2. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${return_url}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: return_url.replace('success', 'canceled'),
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        )
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
