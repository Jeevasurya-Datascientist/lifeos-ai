import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function RefundPolicy() {
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
                            href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/refund"
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
                            <RefreshCw className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Cancellation & Refund Policy</CardTitle>
                        <p className="text-slate-500">Last updated: December 26, 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none pt-8 space-y-6 text-slate-700">
                        <p>
                            <strong>JEEVASURYA PALANISAMY</strong> believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Cancellations</h3>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>
                                Cancellations will be considered only if the request is made within <strong>3-5 days</strong> of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                            </li>
                            <li>
                                JEEVASURYA PALANISAMY does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Damaged or Defective Items</h3>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>
                                In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within <strong>3-5 days</strong> of receipt of the products.
                            </li>
                            <li>
                                In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>3-5 days</strong> of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                            </li>
                            <li>
                                In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Refund Timeline</h3>
                        <p>
                            In case of any Refunds approved by the JEEVASURYA PALANISAMY, it’ll take <strong>6-8 days</strong> for the refund to be processed to the end customer.
                        </p>
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <a
                                href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/refund"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-2"
                            >
                                View Official Refund Policy on Razorpay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
