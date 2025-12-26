import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
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
                            href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/privacy"
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
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Privacy Policy</CardTitle>
                        <p className="text-slate-500">Last updated: December 26, 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none pt-8 space-y-6 text-slate-700">
                        <p>
                            This privacy policy sets out how <strong>JEEVASURYA PALANISAMY</strong> uses and protects any information that you give JEEVASURYA PALANISAMY when you visit their website and/or agree to purchase from them.
                        </p>
                        <p>
                            JEEVASURYA PALANISAMY is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.
                        </p>
                        <p>
                            JEEVASURYA PALANISAMY may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">We may collect the following information:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Name</li>
                            <li>Contact information including email address</li>
                            <li>Demographic information such as postcode, preferences and interests, if required</li>
                            <li>Other information relevant to customer surveys and/or offers</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">What we do with the information we gather</h3>
                        <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Internal record keeping.</li>
                            <li>We may use the information to improve our products and services.</li>
                            <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
                            <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail.</li>
                            <li>We may use the information to customise the website according to your interests.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Security</h3>
                        <p>
                            We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">How we use cookies</h3>
                        <p>
                            A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
                        </p>
                        <p>
                            We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
                        </p>
                        <p>
                            Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
                        </p>
                        <p>
                            You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 mt-8">Controlling your personal information</h3>
                        <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes</li>
                            <li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <a href="mailto:jeevasuriya2007@gmail.com" className="text-indigo-600 hover:underline">jeevasuriya2007@gmail.com</a></li>
                        </ul>
                        <p>
                            We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
                        </p>
                        <p>
                            If you believe that any information we are holding on you is incorrect or incomplete, please write to or contact us as soon as possible. We will promptly correct any information found to be incorrect.
                        </p>

                        <div className="mt-12 p-6 bg-slate-100 rounded-lg border border-slate-200">
                            <h4 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h4>
                            <p className="mb-2"><strong>Address:</strong> Periyayeepalayam, Thirumurugan Poondi, Avinashi Coimbatore TAMIL NADU 641654</p>
                            <p className="mb-2"><strong>Phone:</strong> 9789456787</p>
                            <p><strong>Email:</strong> <a href="mailto:jeevasuriya2007@gmail.com" className="text-indigo-600 hover:underline">jeevasuriya2007@gmail.com</a></p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <a
                                href="https://merchant.razorpay.com/policy/RhSzbdrsTTeckb/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-2"
                            >
                                View Official Privacy Policy on Razorpay
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
