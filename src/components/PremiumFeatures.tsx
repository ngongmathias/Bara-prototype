import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X, Star, Zap, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

type Plan = 'normal' | 'pro' | 'premium';

const features = [
  { nameKey: 'premiumFeatures.features.businessProfile', normal: true, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.basicContact', normal: true, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.socialLinks', normal: false, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.photoGallery', normal: false, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.businessHours', normal: false, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.productServices', normal: false, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.customerReviews', normal: true, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.prioritySupport', normal: false, pro: true, premium: true },
  { nameKey: 'premiumFeatures.features.analytics', normal: false, pro: false, premium: true },
  { nameKey: 'premiumFeatures.features.featuredListings', normal: false, pro: false, premium: true },
  { nameKey: 'premiumFeatures.features.unlimitedUploads', normal: false, pro: false, premium: true },
  { nameKey: 'premiumFeatures.features.customDomain', normal: false, pro: false, premium: true },
];

const plans = [
  {
    nameKey: 'premiumFeatures.plans.normal.name',
    priceKey: 'premiumFeatures.plans.normal.price',
    descriptionKey: 'premiumFeatures.plans.normal.description',
    buttonKey: 'premiumFeatures.plans.normal.button',
    popular: false,
    type: 'normal' as Plan,
  },
  {
    nameKey: 'premiumFeatures.plans.pro.name',
    priceKey: 'premiumFeatures.plans.pro.price',
    periodKey: 'premiumFeatures.common.perMonth',
    descriptionKey: 'premiumFeatures.plans.pro.description',
    buttonKey: 'premiumFeatures.plans.pro.button',
    popular: true,
    type: 'pro' as Plan,
  },
  {
    nameKey: 'premiumFeatures.plans.premium.name',
    priceKey: 'premiumFeatures.plans.premium.price',
    periodKey: 'premiumFeatures.common.perMonth',
    descriptionKey: 'premiumFeatures.plans.premium.description',
    buttonKey: 'premiumFeatures.plans.premium.button',
    popular: false,
    type: 'premium' as Plan,
  },
];

export const PremiumFeatures = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const { toast } = useToast();

  const handleSelectPlan = (plan: Plan) => {
    if (plan === 'normal') {
      // Free plan - show activation message
      toast({
        title: "Free Plan Active",
        description: "You're using the free plan. All basic features are available!",
      });
    } else {
      // Paid plans - show coming soon message
      setSelectedPlan(plan);
      setIsPaymentOpen(true);
    }
  };

  const handleContactSales = () => {
    const planName = selectedPlan === 'pro' ? 'Pro' : 'Premium';
    const subject = encodeURIComponent(`Premium Plan Inquiry - ${planName}`);
    const body = encodeURIComponent(
      `Hi BARA Team,\n\nI'm interested in upgrading to the ${planName} plan.\n\nPlease contact me with payment options and setup instructions.\n\nThank you!`
    );
    window.location.href = `mailto:support@baraafrika.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            {t('premiumFeatures.hero.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('premiumFeatures.hero.subtitle')}
          </p>
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={`font-medium ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              {t('premiumFeatures.billing.monthly')}
            </span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
            >
              <span className="sr-only">Toggle billing period</span>
              <span
                aria-hidden="true"
                className={`${isYearly ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
            <div className="relative">
              <span className="font-medium text-muted-foreground">
                {t('premiumFeatures.billing.yearly')}
              </span>
              <span className="absolute -right-4 -top-4 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {t('premiumFeatures.billing.save')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan) => (
            <div key={plan.type} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {t('premiumFeatures.common.mostPopular')}
                  </div>
                </div>
              )}
              <Card className={`h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">{t(plan.nameKey)}</CardTitle>
                      <p className="text-muted-foreground mt-1">{t(plan.descriptionKey)}</p>
                    </div>
                    {plan.popular && <Star className="h-5 w-5 text-yellow-400" />}
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-foreground">
                      {t(plan.priceKey)}
                      {(plan as any).periodKey && (
                        <span className="text-lg font-normal text-muted-foreground">
                          {isYearly ? t('premiumFeatures.common.perYear') : t((plan as any).periodKey)}
                        </span>
                      )}
                    </p>
                    {isYearly && plan.type !== 'normal' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('premiumFeatures.pricing.billedAnnually', { amount: plan.type === 'pro' ? '50' : '200' })}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature.nameKey} className="flex items-start">
                        {feature[plan.type] ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-foreground">{t(feature.nameKey)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    onClick={() => handleSelectPlan(plan.type)}
                    className={`w-full py-6 text-base ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-foreground hover:bg-foreground/90'}`}
                  >
                    {t(plan.buttonKey)}
                    {plan.popular && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Sales Modal for Paid Plans */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Premium Plan Upgrade</DialogTitle>
            <DialogDescription>
              {selectedPlan ? `Upgrade to ${selectedPlan === 'pro' ? 'Pro' : 'Premium'} plan` : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Payment Setup Notice */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-semibold">Payment Processing Coming Soon</AlertTitle>
            <AlertDescription className="text-yellow-700">
              We're setting up secure payment processing. Contact us to upgrade early and get priority access!
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-foreground">
                  {selectedPlan ? t('premiumFeatures.payment.selectedPlan', { plan: t(`premiumFeatures.planNames.${selectedPlan}`) }) : ''}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === 'normal' 
                    ? t('premiumFeatures.payment.freeForever') 
                    : isYearly 
                      ? t('premiumFeatures.payment.annualBilling', { amount: selectedPlan === 'pro' ? '50' : '200' })
                      : t('premiumFeatures.payment.monthlyBilling', { amount: selectedPlan === 'pro' ? '5' : '20' })}
                </p>
              </div>
              {selectedPlan !== 'normal' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsYearly(!isYearly)}
                  className="text-sm"
                >
                  {t('premiumFeatures.payment.switchBilling', { to: isYearly ? t('premiumFeatures.billing.monthly') : t('premiumFeatures.billing.yearly') })}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Input id="message" placeholder="Tell us about your business..." />
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleContactSales}
                className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Sales Team
              </Button>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                We'll respond within 24 hours with payment options
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumFeatures;
