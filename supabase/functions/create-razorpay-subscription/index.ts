const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { plan_id } = await req.json()
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error("Missing Razorpay Keys");
            return new Response(
                JSON.stringify({ error: "Missing Razorpay Keys in Server Configuration" }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create Subscription via Razorpay API
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

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
            console.error("Razorpay Error:", data);
            throw new Error(data.error?.description || "Failed to create subscription");
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error("Edge Function Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
});
