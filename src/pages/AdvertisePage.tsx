import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import {
  Zap,
  Target,
  TrendingUp,
  Crown,
  MousePointer2,
  ShieldCheck,
  BarChart3,
  Rocket,
  ArrowRight,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

const AdvertisePage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <TopBannerAd />

      {/* Launch Period Banner */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-6 py-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">🎉 Launch Period — All Features Free!</p>
            <p className="text-xs text-green-600">During our launch, all Bara Prime advertising features are available at no cost. Set up your campaigns now and lock in early-adopter benefits before paid plans go live.</p>
          </div>
        </div>
      </section>

      {/* Hero Section - Super Premium */}
      <section className="relative pt-12 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-70 -z-10" />

        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-black uppercase tracking-widest mb-8">
              <Rocket size={14} />
              Bara Prime Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-comfortaa tracking-tighter text-black mb-8 leading-[1.1]">
              Dominate the <span className="text-blue-600">African Diaspora</span> Market.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-roboto mb-12">
              Stop guessing. Start growing. Access high-fidelity targeting, auction-based bidding, and real-time ROI tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 bg-black text-white hover:bg-gray-900 rounded-full font-bold text-lg group" asChild>
                <Link to="/advertise/checkout">
                  Start Promoting Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full font-bold text-lg border-2" onClick={() => window.location.href = 'mailto:business@baraafrika.com?subject=Media Kit Request'}>
                Download Media Kit
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-black text-white rounded-[3rem] mx-4 my-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-comfortaa mb-4">How Bara Ads Work</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Three simple steps to reach the African diaspora market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { step: "1", icon: MousePointer2, title: "Create Your Campaign", desc: "Choose your ad type — sponsored listing, banner ad, or featured placement. Set your budget and target audience." },
              { step: "2", icon: Target, title: "Reach the Right People", desc: "Your ad appears to users browsing businesses, events, and marketplace listings in your target categories and locations." },
              { step: "3", icon: BarChart3, title: "Track Your Results", desc: "Monitor impressions, clicks, and conversions in real-time from your dashboard. Only pay for actual engagement." }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={28} />
                </div>
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Step {item.step}</div>
                <h4 className="font-bold text-xl mb-3">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-full" asChild>
              <Link to="/advertise/checkout">Start Your Campaign <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Prime Tiers */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-comfortaa text-black mb-4">Choose Your Ecosystem Tier</h2>
            <p className="text-gray-600">Upgrade your brand status and unlock powerful platform utilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Standard */}
            <Card className="border-none shadow-none bg-gray-50 p-8 rounded-3xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold font-comfortaa">Standard</CardTitle>
                <p className="text-gray-500 text-sm">Basic presence for local sellers.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-4xl font-black text-black mb-8">$0<span className="text-sm font-normal text-gray-500">/forever</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-sm"><ShieldCheck size={16} className="text-gray-400" /> Basic Marketplace Listings</li>
                  <li className="flex items-center gap-2 text-sm"><ShieldCheck size={16} className="text-gray-400" /> Public Profile</li>
                  <li className="flex items-center gap-2 text-sm text-gray-400 line-through"><Circle size={16} /> Verified Badge</li>
                </ul>
                <Button className="w-full h-12 bg-white text-black border-2 border-gray-200 hover:bg-gray-100 rounded-xl font-bold" asChild><Link to="/user/sign-up">Get Started</Link></Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-none shadow-2xl bg-white p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Crown className="text-blue-600" size={24} />
              </div>
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold font-comfortaa text-blue-600">Bara Pro</CardTitle>
                <p className="text-gray-500 text-sm">Best for growing creators & shops.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-4xl font-black text-black mb-8">$5<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-sm font-bold"><TrendingUp size={16} className="text-blue-600" /> 2x Engagement Multiplier</li>
                  <li className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={16} className="text-blue-600" /> Verified "Pro" Badge</li>
                  <li className="flex items-center gap-2 text-sm font-bold"><BarChart3 size={16} className="text-blue-600" /> Marketing Dashboard</li>
                  <li className="flex items-center gap-2 text-sm font-bold"><Globe size={16} className="text-blue-600" /> Global Priority Search</li>
                </ul>
                <Button className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl font-bold" asChild><Link to="/advertise/checkout">Claim Pro Status</Link></Button>
              </CardContent>
            </Card>

            {/* Elite */}
            <Card className="border-none shadow-none bg-zinc-900 p-8 rounded-3xl text-white">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold font-comfortaa text-yellow-500 flex items-center gap-2">
                  Elite
                  <Zap size={20} fill="#eab308" />
                </CardTitle>
                <p className="text-gray-500 text-sm">Enterprise-grade domination.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-4xl font-black text-white mb-8">$20<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-sm"><ShieldCheck size={16} className="text-yellow-500" /> All Pro features</li>
                  <li className="flex items-center gap-2 text-sm"><ShieldCheck size={16} className="text-yellow-500" /> Zero Ad Commission</li>
                  <li className="flex items-center gap-2 text-sm font-bold"><Crown size={16} className="text-yellow-500" /> Featured Homepage Spot</li>
                </ul>
                <Button className="w-full h-12 bg-white text-black hover:bg-gray-100 rounded-xl font-bold" onClick={() => window.location.href = 'mailto:business@baraafrika.com?subject=Bara Elite Inquiry'}>Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hub Navigation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-black font-comfortaa text-center mb-8">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/advertise/checkout" className="group">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 text-center">
                <Rocket className="mx-auto mb-3 text-blue-600" size={28} />
                <h4 className="font-bold text-sm">Start Campaign</h4>
                <p className="text-xs text-gray-500 mt-1">Set up your Bara Prime ad campaign</p>
              </Card>
            </Link>
            <Link to="/pricing" className="group">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 text-center">
                <Crown className="mx-auto mb-3 text-yellow-500" size={28} />
                <h4 className="font-bold text-sm">Pricing Plans</h4>
                <p className="text-xs text-gray-500 mt-1">Compare Free, Pro & Elite tiers</p>
              </Card>
            </Link>
            <Link to="/partners" className="group">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 text-center">
                <Globe className="mx-auto mb-3 text-green-600" size={28} />
                <h4 className="font-bold text-sm">Partner Program</h4>
                <p className="text-xs text-gray-500 mt-1">Earn commissions as an affiliate</p>
              </Card>
            </Link>
            <Link to="/sponsor-country" className="group">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 text-center">
                <Target className="mx-auto mb-3 text-purple-600" size={28} />
                <h4 className="font-bold text-sm">Sponsor a Country</h4>
                <p className="text-xs text-gray-500 mt-1">Premium country page sponsorship</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Circle = ({ size, className }: { size: number, className?: string }) => (
  <div style={{ width: size, height: size }} className={`border-2 rounded-full ${className}`} />
);

export default AdvertisePage;
