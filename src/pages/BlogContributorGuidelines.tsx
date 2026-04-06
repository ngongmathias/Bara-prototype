import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, CheckCircle, AlertCircle, FileText, Globe, PenLine, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function BlogContributorGuidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Contributor Guidelines
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            www.BARAAfrika.com/Blog
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Thank you for your interest in contributing to{' '}
            <a href="https://www.BARAAfrika.com" className="font-semibold text-black hover:underline">
              www.BARAAfrika.com
            </a>
            , a platform dedicated to pan-African narratives, ideas, and dialogue. To ensure our content
            is cohesive and impactful, please adhere to the following criteria before submitting your article.
          </p>
        </div>

        {/* Section 1: Content & Thematic Focus */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-xl font-bold text-gray-900">Content & Thematic Focus</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed pl-11">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4" /> Pan-African Leaning
              </h3>
              <p>
                Submissions should reflect, explore, or engage with pan-African themes — connecting
                cultures, histories, and futures across the continent and diaspora.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" /> Tone & Quality
              </h3>
              <p>
                Blogs must be interesting, well-written, and intelligible. We seek insightful,
                compelling, and accessible writing.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How to Submit (in-app) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-gray-900">How to Submit</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed pl-11">
            <p>
              All submissions are done directly on the platform — no email required. Here's how it works:
            </p>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
                <span>Click <strong>"Write Article"</strong> below (you must be signed in).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
                <span>Write your article, add a featured image, select a category, and add tags.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
                <span>Click <strong>"Submit for Review"</strong> when ready. You can save a draft first if needed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">4</span>
                <span>Our editorial team will review your submission. You'll see the status update in <strong>"My Articles"</strong> on your profile.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">5</span>
                <span>If approved, your article goes live. If declined, you'll receive feedback explaining why and you can revise and resubmit.</span>
              </li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-2">
              <p className="text-sm text-gray-600">
                Response time: Our editorial team will review your submission within <strong>5–7 business days</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Formatting */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">3</div>
            <h2 className="text-xl font-bold text-gray-900">Formatting Requirements</h2>
          </div>
          <div className="space-y-3 text-gray-700 leading-relaxed pl-11">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
              <p><span className="font-semibold">Word count:</span> 800 – 2,500 words</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
              <p><span className="font-semibold">Format:</span> Use clear headings, short paragraphs, and bullet points where appropriate</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
              <p><span className="font-semibold">Images:</span> Include at least one high-quality featured image (1200×630px recommended)</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
              <p><span className="font-semibold">Originality:</span> All submissions must be original and not published elsewhere</p>
            </div>
          </div>
        </div>

        {/* Section 4: Content Policies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">4</div>
            <h2 className="text-xl font-bold text-gray-900">Content Policies</h2>
          </div>
          <div className="space-y-3 text-gray-700 leading-relaxed pl-11">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-400" />
              <p>No hate speech, discriminatory content, or content promoting violence</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-400" />
              <p>No plagiarism — all sources must be properly credited</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-400" />
              <p>No promotional or sponsored content without prior approval</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-green-500" />
              <p>BARA reserves the right to edit submissions for clarity, length, and style</p>
            </div>
          </div>
        </div>

        {/* Section 5: Support / Questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">5</div>
            <h2 className="text-xl font-bold text-gray-900">Have Questions?</h2>
          </div>
          <div className="pl-11 space-y-3 text-gray-700">
            <p>
              If you have questions about these guidelines or the status of your submission, email our editorial team:
            </p>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href="mailto:barablogsubmission@gmail.com" className="font-semibold text-black hover:underline">
                barablogsubmission@gmail.com
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Please do not use this email to submit articles — all submissions must go through the platform.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-black text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to contribute?</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Write your article directly on the platform and submit it for review. No emails needed.
          </p>
          <Link to="/blog/write">
            <Button className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-3 h-auto text-base">
              <PenLine className="w-5 h-5 mr-2" />
              Write Your Article
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
