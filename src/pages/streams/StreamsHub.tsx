import { Link } from 'react-router-dom';
import { Music, Film, BookOpen, Headphones, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/SEO';
import { DiscoverMore } from '@/components/DiscoverMore';

const STREAM_CATEGORIES = [
  {
    title: 'Music',
    description: 'Afrobeats, Amapiano, Highlife, Gospel, and more. Stream millions of tracks from African artists worldwide.',
    icon: Music,
    to: '/streams/music',
    gradient: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    available: true,
    tag: 'Live',
  },
  {
    title: 'Movies',
    description: 'Nollywood, African cinema, documentaries, and short films. Watch stories from the continent.',
    icon: Film,
    to: '/streams/movies',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    available: true,
    tag: 'Live',
  },
  {
    title: 'Ebooks',
    description: 'African literature, business, self-help, and academic resources. Read on any device.',
    icon: BookOpen,
    to: '/streams/ebooks',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    available: true,
    tag: 'Live',
  },
  {
    title: 'Podcasts',
    description: 'Culture, politics, tech, and storytelling. Listen to voices from across the African diaspora.',
    icon: Headphones,
    to: '/streams/podcasts',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    available: true,
    tag: 'Live',
  },
  {
    title: 'Gaming',
    description: 'Game streams, esports highlights, and African gaming community content.',
    icon: Gamepad2,
    to: '/streams/gaming',
    gradient: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    available: false,
    tag: 'Coming Soon',
  },
];

export default function StreamsHub() {
  return (
    <MainLayout>
      <SEO
        title="BARA Streams — Music, Movies, Podcasts & More"
        description="Your gateway to African entertainment. Stream music, watch movies, read ebooks, listen to podcasts, and follow gaming — all in one place."
        keywords={['African Streaming', 'Afrobeats', 'Nollywood', 'African Podcasts', 'BARA Streams']}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">BARA Streams</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 font-comfortaa leading-tight">
              Your World of<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                African Entertainment
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Music, movies, ebooks, podcasts, and gaming — all from the African continent and diaspora. Choose your stream.
            </p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STREAM_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const CardContent = (
                <div
                  className={`relative group rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
                    cat.available
                      ? 'border-gray-200 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                      : 'border-gray-100 opacity-80'
                  }`}
                >
                  {/* Gradient Top Bar */}
                  <div className={`h-2 bg-gradient-to-r ${cat.gradient}`} />

                  <div className="p-6 sm:p-8">
                    {/* Icon + Tag */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${cat.bgLight} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${cat.textColor}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        cat.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-comfortaa">
                      {cat.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      {cat.description}
                    </p>

                    {/* CTA */}
                    {cat.available ? (
                      <div className={`inline-flex items-center gap-2 text-sm font-bold ${cat.textColor} group-hover:gap-3 transition-all`}>
                        Explore {cat.title}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 font-medium">
                        Available soon — stay tuned
                      </div>
                    )}
                  </div>
                </div>
              );

              return cat.available ? (
                <Link key={cat.title} to={cat.to} className="block">
                  {CardContent}
                </Link>
              ) : (
                <div key={cat.title}>
                  {CardContent}
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-comfortaa">
              One Platform, Endless Entertainment
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              BARA Streams brings together the best of African entertainment under one roof.
              Start with Music, Movies, Ebooks, and Podcasts today, with Gaming launching soon.
              All content is curated to celebrate African creativity and culture.
            </p>
          </div>
        </div>

        <DiscoverMore exclude={['Streams']} maxItems={3} />
      </div>
    </MainLayout>
  );
}
