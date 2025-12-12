import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, HelpCircle, Briefcase } from "lucide-react";

const FaqPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const generalFAQs = Array.from({ length: 10 }).map((_, i) => ({
    question: t(`faq.general.items.${i}.q`),
    answer: t(`faq.general.items.${i}.a`),
  }));

  const businessFAQs = Array.from({ length: 10 }).map((_, i) => ({
    question: t(`faq.business.items.${i}.q`),
    answer: t(`faq.business.items.${i}.a`),
  }));

  return (
    <div className="relative min-h-screen bg-white">
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              FAQ
            </h1>
            <p className="text-lg text-gray-500 max-w-xl">
              {t('faq.subtitle') || 'Find answers to commonly asked questions about BARA'}
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* General Questions Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">{t('faq.general.title') || 'General Questions'}</h2>
                  <p className="text-sm text-gray-500">{t('faq.general.subtitle')}</p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="space-y-3">
                {generalFAQs.map((faq, index) => (
                  <AccordionItem 
                    key={`general-${index}`}
                    value={`general-${index}`}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-colors bg-white/70 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="px-5 py-4 text-left hover:no-underline font-medium text-black">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-4 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>

            {/* For Business Owners Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">{t('faq.business.title') || 'For Business Owners'}</h2>
                  <p className="text-sm text-gray-500">{t('faq.business.subtitle')}</p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="space-y-3">
                {businessFAQs.map((faq, index) => (
                  <AccordionItem 
                    key={`business-${index}`}
                    value={`business-${index}`}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-colors bg-white/70 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="px-5 py-4 text-left hover:no-underline font-medium text-black">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-4 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-8 border border-gray-200 rounded-2xl bg-white/70 backdrop-blur-sm"
            >
              <h3 className="text-2xl font-bold text-black mb-4">{t('faq.cta.title') || 'Still have questions?'}</h3>
              <p className="text-gray-500 mb-6">{t('faq.cta.subtitle') || 'We\'re here to help'}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/contact-us" 
                  className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {t('faq.cta.contact') || 'Contact Us'}
                </Link>
                <Link 
                  to="/advertise" 
                  className="px-6 py-3 border border-gray-200 text-black font-medium rounded-xl hover:border-black transition-colors"
                >
                  {t('faq.cta.business') || 'For Business'}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
