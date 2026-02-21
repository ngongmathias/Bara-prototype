import { Megaphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SponsorshipBanner = () => {
    return (
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 text-white shadow-xl relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-32 h-full bg-white opacity-5 skew-x-12 -translate-x-10 group-hover:-translate-x-5 transition-transform duration-500"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-full">
                        <Megaphone size={28} className="text-white animate-bounce-subtle" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Reach Millions of Sports Fans</h3>
                        <p className="text-white/80 text-sm font-medium">Sponsor this page and get your brand in front of the most engaged audience in Africa.</p>
                    </div>
                </div>

                <Link
                    to="/advertise"
                    className="bg-white text-red-600 px-6 py-2.5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2 shrink-0 group/btn"
                >
                    Sponsor This Page
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
