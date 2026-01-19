import { useState } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Mail } from 'lucide-react';

type Plan = 'basic' | 'standard' | 'premium';

const plans: Record<Plan, { name: string; price: number; features: string[] }> = {
  basic: { name: 'Basic', price: 19, features: ['Sidebar placement', 'Basic analytics'] },
  standard: { name: 'Standard', price: 49, features: ['Homepage rotation', 'Priority listing', 'Click analytics'] },
  premium: { name: 'Premium', price: 99, features: ['Hero banner rotation', 'Top category placement', 'Full analytics'] },
};

const AdvertiseCheckoutPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('standard');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');

  const handleContactSales = () => {
    const plan = plans[selectedPlan];
    const subject = encodeURIComponent(`Advertising Inquiry - ${plan.name} Plan`);
    const body = encodeURIComponent(
      `Hi BARA Team,\n\nI'm interested in the ${plan.name} advertising plan ($${plan.price}/month).\n\nBusiness Name: ${businessName}\nEmail: ${email}\n\nPlease contact me with payment options and next steps.\n\nThank you!`
    );
    window.location.href = `mailto:sales@baraafrika.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold font-comfortaa text-yp-dark mb-6">Advertise with BARA</h1>

        {/* Payment Setup Notice */}
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 font-semibold">Payment Processing Setup In Progress</AlertTitle>
          <AlertDescription className="text-yellow-700">
            We're currently setting up secure payment processing for online transactions. 
            To start advertising now, please contact our sales team at{' '}
            <a href="mailto:sales@baraafrika.com" className="underline font-semibold hover:text-yellow-900">
              sales@baraafrika.com
            </a>
            {' '}or use the contact button below.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans */}
          {(['basic','standard','premium'] as Plan[]).map((planKey) => {
            const plan = plans[planKey];
            const isActive = selectedPlan === planKey;
            return (
              <Card key={planKey} className={isActive ? 'border-yp-blue ring-1 ring-yp-blue' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <span className="text-yp-blue">${plan.price}/mo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Button onClick={() => setSelectedPlan(planKey)} className="mt-4 w-full bg-yp-blue text-white">
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Checkout form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Business Name</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business" />
              </div>
              <div>
                <Label className="mb-1 block">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-1 block">Card Information</Label>
                <Input placeholder="Card number (Visa, Mastercard, etc.)" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input placeholder="MM / YY" />
                  <Input placeholder="CVC" />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleContactSales} 
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales Team
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Our team will respond within 24 hours with payment options and setup instructions.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AdvertiseCheckoutPage;



