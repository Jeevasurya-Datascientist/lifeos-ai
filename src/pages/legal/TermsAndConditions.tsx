import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
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
                            href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/terms"
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
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Terms and Conditions</CardTitle>
                        <p className="text-slate-500">Last updated: December 26, 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none pt-8 space-y-6 text-slate-700">
                        <p>
                            For the purpose of these Terms and Conditions, The term <strong>"we", "us", "our"</strong> used anywhere on this page shall mean <strong>JEEVASURYA PALANISAMY</strong>, whose registered/operational office is Periyayeepalayam, Thirumurugan Poondi, Avinashi Coimbatore TAMIL NADU 641654.
                        </p>
                        <p>
                            <strong>"you", “your”, "user", “visitor”</strong> shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Your use of the website and/or purchase from us are governed by following Terms and Conditions:</h3>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>The content of the pages of this website is subject to change without notice.</li>
                            <li>
                                Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                            </li>
                            <li>
                                Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                            </li>
                            <li>
                                Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                            </li>
                            <li>
                                All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                            </li>
                            <li>
                                Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                            </li>
                            <li>
                                From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information. You may not create a link to our website from another website or document without JEEVASURYA PALANISAMY’s prior written consent.
                            </li>
                            <li>
                                Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.
                            </li>
                            <li>
                                We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
                            </li>
                        </ul>
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <a
                                href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-2"
                            >
                                View Official Terms & Conditions on Razorpay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
