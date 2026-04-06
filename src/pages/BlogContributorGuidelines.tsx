import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Mail, CheckCircle, AlertCircle, FileText, Globe } from 'lucide-react';

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
            is cohesive and impactful, please adhere to the following criteria:
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

        {/* Section 2: Submission Process */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-gray-900">How to Submit</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed pl-11">
            <p>All articles must be submitted to our editorial team for review. Direct publishing by users is not available.</p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Send your submission to:
              </h3>
              <a href="mailto:blog@baraafrika.com" className="text-lg font-bold text-black hover:underline">
                blog@baraafrika.com
              </a>
            </div>
            <p>Please include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Your full name and a brief bio (2-3 sentences)</li>
              <li>A headshot or profile photo</li>
              <li>Your article in a Word document or Google Doc</li>
              <li>Any images you'd like included (with credits/permissions)</li>
              <li>Your preferred category from our blog categories</li>
            </ul>
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
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-green-500" />
              <p>Response time: Our editorial team will respond within 5-7 business days</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-black text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to contribute?</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Send your article to our editorial team and become part of the BARA Blog community.
          </p>
          <a
            href="mailto:blog@baraafrika.com?subject=BARA Blog Submission"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            <Mail className="w-5 h-5" />
            Submit Your Article
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
