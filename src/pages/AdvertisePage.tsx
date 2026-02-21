import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Target,
  Users,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Star,
  BarChart3,
  Eye,
  X,
  Loader2,
  Calendar,
} from "lucide-react";

const AdvertisePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '' });

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ title: 'Please fill in your name and email.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // Confirmation email to the user
      await supabase.from('email_queue').insert({
        to_email: form.email,
        subject: '📅 Consultation Request Received - Bara Afrika',
        html_content: `<p>Hi ${form.name},</p><p>Thank you for reaching out! We have received your consultation request and will get back to you within 24 hours.</p><p><strong>Business:</strong> ${form.business || 'N/A'}<br><strong>Message:</strong> ${form.message || 'N/A'}</p><p>— The Bara Afrika Team</p>`,
        metadata: { type: 'consultation_request', business: form.business }
      });
      // Admin notification
      await supabase.from('email_queue').insert({
        to_email: 'advertise@baraafrika.com',
        subject: `📅 New Consultation Request from ${form.name}`,
        html_content: `<p><strong>Name:</strong> ${form.name}<br><strong>Email:</strong> ${form.email}<br><strong>Business:</strong> ${form.business || 'N/A'}</p><p><strong>Message:</strong><br>${form.message || 'N/A'}</p>`,
        metadata: { type: 'consultation_admin_notify' }
      });
      toast({ title: '✅ Request Sent!', description: "We'll be in touch within 24 hours." });
      setShowConsultationModal(false);
      setForm({ name: '', email: '', business: '', message: '' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to send. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <TopBannerAd />
      <div className="relative min-h-screen bg-white">

        {/* Hero / Stats */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-comfortaa text-black mb-4">
              {t('advertise.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-roboto mb-12">
              {t('advertise.hero.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-black">100K+</div>
                <p className="text-gray-600 font-roboto">{t('advertise.stats.monthlyVisitors')}</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-black">1K+</div>
                <p className="text-gray-600 font-roboto">{t('advertise.stats.businesses')}</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-black">95%</div>
                <p className="text-gray-600 font-roboto">{t('advertise.stats.satisfaction')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-comfortaa">
                {t('advertise.services.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-roboto">
                {t('advertise.services.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Premium Listing */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                  <CardTitle className="text-xl font-comfortaa">{t('advertise.services.premium.title')}</CardTitle>
                  <CardDescription className="font-roboto">{t('advertise.services.premium.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.premium.feature1')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.premium.feature2')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.premium.feature3')}</li>
                  </ul>
                  <Button className="w-full font-roboto bg-black hover:bg-gray-800" asChild>
                    <Link to="/claim-listing">{t('advertise.services.premium.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Targeted Advertising */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-comfortaa">{t('advertise.services.targeted.title')}</CardTitle>
                  <CardDescription className="font-roboto">{t('advertise.services.targeted.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.targeted.feature1')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.targeted.feature2')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.targeted.feature3')}</li>
                  </ul>
                  <Button className="w-full font-roboto" variant="outline" onClick={() => setShowConsultationModal(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('advertise.services.targeted.cta')}
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics & Insights */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-comfortaa">{t('advertise.services.analytics.title')}</CardTitle>
                  <CardDescription className="font-roboto">{t('advertise.services.analytics.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.analytics.feature1')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.analytics.feature2')}</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-black mr-2" />{t('advertise.services.analytics.feature3')}</li>
                  </ul>
                  <Button className="w-full font-roboto" variant="outline" asChild>
                    <Link to="/users/dashboard">{t('advertise.services.analytics.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-comfortaa">
                {t('advertise.whyChoose.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-roboto">
                {t('advertise.whyChoose.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Users className="w-8 h-8 text-white" />, title: t('advertise.whyChoose.reach.title'), desc: t('advertise.whyChoose.reach.description') },
                { icon: <TrendingUp className="w-8 h-8 text-white" />, title: t('advertise.whyChoose.growth.title'), desc: t('advertise.whyChoose.growth.description') },
                { icon: <Globe className="w-8 h-8 text-white" />, title: t('advertise.whyChoose.local.title'), desc: t('advertise.whyChoose.local.description') },
                { icon: <Eye className="w-8 h-8 text-white" />, title: t('advertise.whyChoose.visibility.title'), desc: t('advertise.whyChoose.visibility.description') },
              ].map((item, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">{item.icon}</div>
                  <h3 className="text-lg font-semibold font-comfortaa">{item.title}</h3>
                  <p className="text-gray-600 text-sm font-roboto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section — FULLY FUNCTIONAL BUTTONS */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-comfortaa text-yellow-400">
              {t('advertise.cta.title')}
            </h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto font-roboto text-gray-300">
              {t('advertise.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-roboto bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8" asChild>
                <Link to="/advertise/checkout">🚀 Start Advertising Today</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-roboto px-8"
                onClick={() => setShowConsultationModal(true)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-comfortaa">
                {t('advertise.contact.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-roboto">
                {t('advertise.contact.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-comfortaa">{t('advertise.contact.phone.title')}</h3>
                <a href="tel:+250791568519" className="text-gray-600 font-roboto hover:text-black block">(+250) 791 568 519</a>
                <p className="text-sm text-gray-500 font-roboto">{t('advertise.contact.phone.hours')}</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-comfortaa">{t('advertise.contact.email.title')}</h3>
                <a href="mailto:advertise@baraafrika.com" className="text-gray-600 font-roboto hover:text-black block">advertise@baraafrika.com</a>
                <p className="text-sm text-gray-500 font-roboto">{t('advertise.contact.email.response')}</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold font-comfortaa">{t('advertise.contact.location.title')}</h3>
                <p className="text-gray-600 font-roboto">{t('advertise.contact.location.address')}</p>
                <p className="text-sm text-gray-500 font-roboto">{t('advertise.contact.location.visit')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <BottomBannerAd />
      <Footer />

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowConsultationModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-comfortaa">Schedule a Consultation</h2>
                <p className="text-gray-500 text-sm mt-1">We'll get back to you within 24 hours</p>
              </div>
              <button onClick={() => setShowConsultationModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <Label>Your Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Business / Brand Name</Label>
                <Input value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} placeholder="Your business name" />
              </div>
              <div>
                <Label>What are you looking for?</Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us your advertising goals..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                {submitting ? 'Sending...' : 'Send Request'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvertisePage;
