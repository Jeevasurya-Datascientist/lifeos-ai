import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactUs() {
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
                            href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/contact_us"
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
                            <Building2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Contact Us</CardTitle>
                        <p className="text-slate-500">We're here to help</p>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <p className="text-slate-700 text-lg">
                            You may contact us using the information below:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-500" />
                                    Merchant Legal Entity
                                </h3>
                                <p className="text-slate-600">JEEVASURYA PALANISAMY</p>
                            </div>

                            <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    Registered Address
                                </h3>
                                <p className="text-slate-600">
                                    Periyayeepalayam, Thirumurugan Poondi,<br />
                                    Avinashi, Coimbatore,<br />
                                    TAMIL NADU 641654
                                </p>
                            </div>

                            <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    Operational Address
                                </h3>
                                <p className="text-slate-600">
                                    Periyayeepalayam, Thirumurugan Poondi,<br />
                                    Avinashi, Coimbatore,<br />
                                    TAMIL NADU 641654
                                </p>
                            </div>

                            <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-indigo-500" />
                                    Contact Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-4 h-4" />
                                        <span>9789456787</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="w-4 h-4" />
                                        <a href="mailto:jeevasuriya2007@gmail.com" className="hover:text-indigo-600 transition-colors">
                                            jeevasuriya2007@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <a
                                href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/contact_us"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-2"
                            >
                                View Official Contact Details on Razorpay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
