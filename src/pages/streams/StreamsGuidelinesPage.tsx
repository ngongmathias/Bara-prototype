import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ShieldCheck, Copyright, Ban, AlertTriangle, Flag } from 'lucide-react';

/**
 * §F4 — content guidelines for Bara Streams: what's allowed, copyright
 * rules, and consequences. Linked from upload pages, the report dialog, the
 * DMCA form, and the footer.
 */
export default function StreamsGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Content Guidelines | Bara Afrika Streams"
        description="What's allowed on Bara Afrika Streams — copyright rules, prohibited content, and how reports and takedowns work."
      />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Streams Content Guidelines</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            What's allowed on Bara Afrika Streams, and what happens if it isn't.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Copyright className="w-5 h-5" /> You must own what you upload</h2>
          </div>
          <div className="space-y-3 text-gray-700 leading-relaxed pl-11">
            <p>
              Only upload music, cover art, and other content you wrote, recorded, or otherwise hold the
              rights to — or that you have explicit permission to distribute. This includes samples,
              beats, and cover art: if you didn't make it and don't have a license for it, don't upload it.
            </p>
            <p>
              Every upload requires you to confirm you hold these rights before it publishes. That
              confirmation is a real declaration, not a formality — we act on copyright reports (see §3)
              and repeated violations lose upload access.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Ban className="w-5 h-5" /> What's not allowed</h2>
          </div>
          <ul className="space-y-2 text-gray-700 leading-relaxed pl-11 list-disc list-outside marker:text-gray-400">
            <li>Copyrighted music, samples, or artwork you don't have rights to</li>
            <li>Content that impersonates another artist, label, or person</li>
            <li>Hate speech, harassment, or content that incites violence</li>
            <li>Sexually explicit content or content exploiting minors</li>
            <li>Spam, scams, or repeatedly re-uploading removed content</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">3</div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Flag className="w-5 h-5" /> Reports & takedowns</h2>
          </div>
          <div className="space-y-3 text-gray-700 leading-relaxed pl-11">
            <p>
              Bara Streams publishes instantly and moderates after the fact. Anyone can report a song,
              album, artist, or playlist using the <span className="font-semibold">Report</span> button
              wherever it appears. Copyright holders can file a formal claim without an account via our{' '}
              <Link to="/dmca" className="underline font-semibold text-gray-900">DMCA form</Link>.
            </p>
            <p>
              Our team reviews every report. If we confirm a violation, the content is taken down
              (unpublished, not deleted) and the uploader is notified with the reason. Uploaders can appeal
              by contacting support.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">4</div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Consequences</h2>
          </div>
          <p className="text-gray-700 leading-relaxed pl-11">
            A confirmed violation removes that specific upload. Repeated or severe violations (confirmed
            copyright infringement, impersonation, or content targeting minors) can lead to losing upload
            privileges or account suspension.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
