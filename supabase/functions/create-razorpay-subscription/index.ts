import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { plan_id } = await req.json()
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error("Missing Razorpay Keys")
        }

        // Create Subscription via Razorpay API (using fetch for Deno compatibility without npm)
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

        // Default: 10 years (120 months) or 5 years. 
        // Razorpay requires 'total_count'. 
        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plan_id: plan_id,
                total_count: 120, // 10 Years
                quantity: 1,
                customer_notify: 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.description || "Failed to create subscription");
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
