import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="-ml-4">
                        <Link to="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <a
                            href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/shipping"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Official Policy
                        </a>
                    </Button>
                </div>

                <Card className="shadow-lg border-0">
                    <CardHeader className="space-y-4 border-b bg-white/50 pb-8">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Shipping & Delivery Policy</CardTitle>
                        <p className="text-slate-500">Last updated: December 26, 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none pt-8 space-y-6 text-slate-700">
                        <p>
                            For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only.
                        </p>
                        <p>
                            For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Delivery Timelines</h3>
                        <p>
                            Orders are shipped within <strong>1-2 days</strong> or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                        </p>
                        <p>
                            <strong>JEEVASURYA PALANISAMY</strong> is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 1-2 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                        </p>
                        <p>
                            Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
                        </p>

                        <div className="mt-12 p-6 bg-slate-100 rounded-lg border border-slate-200">
                            <h4 className="text-lg font-bold text-slate-900 mb-4">Contact for Shipping Queries</h4>
                            <p className="mb-2">For any issues in utilizing our services you may contact our helpdesk.</p>
                            <p className="mb-2"><strong>Phone:</strong> 9789456787</p>
                            <p><strong>Email:</strong> <a href="mailto:jeevasuriya2007@gmail.com" className="text-indigo-600 hover:underline">jeevasuriya2007@gmail.com</a></p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <a
                                href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/shipping"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-2"
                            >
                                View Official Shipping Policy on Razorpay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
