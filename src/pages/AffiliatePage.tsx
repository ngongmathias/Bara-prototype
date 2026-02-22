import { useState } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import {
  ArrowRight,
  Banknote,
  Plane,
  Smartphone,
  CreditCard,
  Globe,
  ShieldCheck,
  ExternalLink,
  Heart,
} from 'lucide-react';

interface AffiliatePartner {
  name: string;
  description: string;
  category: 'remittance' | 'travel' | 'fintech' | 'telecom';
  icon: typeof Banknote;
  url: string;
  tagline: string;
  badge?: string;
}

const PARTNERS: AffiliatePartner[] = [
  // Remittance
  {
    name: 'WorldRemit',
    description: 'Send money to 130+ countries with low fees. Fast transfers to mobile money, bank accounts, and cash pickup.',
    category: 'remittance',
    icon: Banknote,
    url: 'https://www.worldremit.com',
    tagline: 'From $0.99 transfer fee',
    badge: 'Popular',
  },
  {
    name: 'Remitly',
    description: 'Trusted by millions for fast, affordable international money transfers to Africa and beyond.',
    category: 'remittance',
    icon: Banknote,
    url: 'https://www.remitly.com',
    tagline: 'First transfer fee-free',
  },
  {
    name: 'Sendwave',
    description: 'Send money to Africa instantly via mobile money. No fees — the exchange rate is the only cost.',
    category: 'remittance',
    icon: Smartphone,
    url: 'https://www.sendwave.com',
    tagline: 'Zero fees',
    badge: 'Best for Africa',
  },
  {
    name: 'Wise (TransferWise)',
    description: 'Get the real exchange rate with transparent, low-cost international transfers.',
    category: 'remittance',
    icon: Globe,
    url: 'https://wise.com',
    tagline: 'Real exchange rate',
  },
  // Travel
  {
    name: 'Booking.com',
    description: 'Find hotels, apartments, and unique stays across Africa and worldwide at the best prices.',
    category: 'travel',
    icon: Plane,
    url: 'https://www.booking.com',
    tagline: 'Free cancellation on most rooms',
    badge: 'Trusted',
  },
  {
    name: 'Kiwi.com',
    description: 'Search and compare flights across all airlines. Find the cheapest routes to and from Africa.',
    category: 'travel',
    icon: Plane,
    url: 'https://www.kiwi.com',
    tagline: 'Cheapest flights guaranteed',
  },
  {
    name: 'SafariBookings',
    description: 'Compare and book African safari tours from 1,000+ operators across 20+ countries.',
    category: 'travel',
    icon: Heart,
    url: 'https://www.safaribookings.com',
    tagline: 'Africa\'s #1 safari marketplace',
    badge: 'Africa Focused',
  },
  // Fintech
  {
    name: 'Chipper Cash',
    description: 'Free cross-border payments across Africa. Send and receive money, buy airtime, and invest.',
    category: 'fintech',
    icon: CreditCard,
    url: 'https://chippercash.com',
    tagline: 'Free P2P transfers in Africa',
    badge: 'Made in Africa',
  },
  {
    name: 'Flutterwave',
    description: 'Accept payments from customers worldwide. The payment infrastructure for Africa.',
    category: 'fintech',
    icon: CreditCard,
    url: 'https://flutterwave.com',
    tagline: 'Payments for Africa',
  },
  // Telecom
  {
    name: 'Airalo',
    description: 'Buy eSIMs for 200+ countries. Stay connected when traveling to Africa without roaming fees.',
    category: 'telecom',
    icon: Smartphone,
    url: 'https://www.airalo.com',
    tagline: 'eSIMs from $4.50',
    badge: 'Recommended',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'remittance', label: 'Send Money' },
  { id: 'travel', label: 'Travel' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'telecom', label: 'Telecom' },
];

export default function AffiliatePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? PARTNERS
    : PARTNERS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Partner Services | Bara Afrika"
        description="Trusted services for the African diaspora — send money, book travel, and manage finances with our recommended partners."
        keywords={['Remittance', 'Africa Travel', 'Fintech', 'Mobile Money', 'Diaspora Services']}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            Trusted Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-comfortaa mb-4">
            Services for the diaspora
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-roboto">
            We've curated the best services for sending money, booking travel, and managing finances across Africa and the diaspora.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {filtered.map((partner) => {
            const Icon = partner.icon;
            return (
              <Card key={partner.name} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{partner.name}</h3>
                        {partner.badge && (
                          <Badge className="bg-green-100 text-green-800 text-[10px]">{partner.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{partner.description}</p>
                      <p className="text-xs font-bold text-green-700 mb-3">{partner.tagline}</p>
                      <Button
                        size="sm"
                        onClick={() => window.open(partner.url, '_blank')}
                        className="bg-black hover:bg-gray-800 text-white text-xs"
                      >
                        Visit {partner.name}
                        <ExternalLink className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="text-center bg-gray-50 rounded-2xl p-8">
          <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-2">Trusted & Verified</h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            All partners listed here are established companies serving the African diaspora. 
            Bara Afrika may earn a referral commission at no extra cost to you, helping us keep the platform free.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
