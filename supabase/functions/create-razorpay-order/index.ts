// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import Razorpay from "npm:razorpay@2.9.2";

console.log("Razorpay Order Function Initialized")

serve(async (req: Request) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { amount, currency = "INR", receipt } = await req.json()

        // Initialize Razorpay
        // @ts-ignore
        const instance = new Razorpay({
            // @ts-ignore
            key_id: Deno.env.get('RAZORPAY_KEY_ID') ?? '',
            // @ts-ignore
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency,
            receipt,
        };

        const order = await instance.orders.create(options);

        return new Response(
            JSON.stringify(order),
            { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        )
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
