export default function StreamsHome() {
    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Left Sidebar */}
            <LeftSidebar />

            {/* Main Content */}
            <main className="flex-1 pb-24 overflow-y-auto">
                <div className="p-6">
                    {/* Greeting */}
                    <h1 className="text-4xl font-bold mb-6">Good evening</h1>

                    {/* Quick Access Tiles */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <QuickAccessTile
                            title="Liked Songs"
                            gradient="from-purple-700 to-purple-500"
                        />
                        <QuickAccessTile
                            title="Discover Weekly"
                            gradient="from-blue-800 to-blue-600"
                        />
                        <QuickAccessTile
                            title="Release Radar"
                            gradient="from-green-700 to-green-500"
                        />
                    </div>

                    {/* Sections */}
                    <Section title="Trending songs">
                        <AlbumCard title="IZNK" artist="9UMWI King" />
                        <AlbumCard title="CHOCOLATE" artist="Chocolate" />
                        <AlbumCard title="wrong roads" artist="wrong roads" />
                        <AlbumCard title="Joystxnz" artist="Joshua Baraka, Arun..." />
                        <AlbumCard title="Heartbreak" artist="Diamond Platnumz" />
                    </Section>

                    <Section title="Popular artists">
                        <ArtistCard name="Davido" />
                        <ArtistCard name="Chris Brown" />
                        <ArtistCard name="Burna Boy" />
                        <ArtistCard name="Drake" />
                        <ArtistCard name="Kendrick Lamar" />
                    </Section>

                    <Section title="Popular albums and singles">
                        <AlbumCard title="Since We're Alone" artist="Niall Horan" />
                        <AlbumCard title="HIT ME HARD AND SOFT" artist="Billie Eilish" />
                        <AlbumCard title="GMX" artist="Noodler Lester" />
                    </Section>
                </div>
            </main>

            {/* Bottom Player */}
            <BottomPlayer />
        </div>
    );
}

function LeftSidebar() {
    return (
        <aside className="w-64 bg-black p-2 flex flex-col gap-2">
            {/* Block 1: Home + Search */}
            <div className="bg-[#121212] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl">Bara Streams</span>
                </div>

                <nav className="space-y-4">
                    <NavItem icon="🏠" label="Home" active />
                    <NavItem icon="🔍" label="Search" />
                </nav>
            </div>

            {/* Block 2: Your Library */}
            <div className="bg-[#121212] rounded-lg p-4 flex-1 flex flex-col">
                {/* Library Header with Icon + Plus Button */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                        <h3 className="text-gray-400 text-sm font-bold">Your Library</h3>
                    </div>
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Playlist Creation Card */}
                <div className="bg-[#242424] rounded-lg p-4 space-y-3 mb-4">
                    <h4 className="font-bold text-base">Create your first playlist</h4>
                    <p className="text-sm text-gray-400">It's easy, we'll help you</p>
                    <button className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:scale-105 transition">
                        Create playlist
                    </button>
                </div>

                {/* Podcast Discovery Card */}
                <div className="bg-[#242424] rounded-lg p-4 space-y-3">
                    <h4 className="font-bold text-base">Let's find some podcasts to follow</h4>
                    <p className="text-sm text-gray-400">We'll keep you updated on new episodes</p>
                    <button className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:scale-105 transition">
                        Browse podcasts
                    </button>
                </div>

                {/* Footer Links */}
                <div className="mt-auto pt-6 text-xs text-gray-400 space-y-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <a href="#" className="hover:text-white hover:underline">Legal</a>
                        <a href="#" className="hover:text-white hover:underline">Privacy Center</a>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <a href="#" className="hover:text-white hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:text-white hover:underline">Cookies</a>
                    </div>
                    <a href="#" className="hover:text-white hover:underline">About Ads</a>

                    <button className="mt-4 border border-gray-400 text-gray-400 hover:border-white hover:text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        English
                    </button>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
    return (
        <a
            href="#"
            className={`flex items-center gap-4 text-sm font-semibold ${active ? 'text-white' : 'text-gray-400 hover:text-white'
                } transition`}
        >
            <span className="text-2xl">{icon}</span>
            {label}
        </a>
    );
}

function QuickAccessTile({ title, gradient }: { title: string; gradient: string }) {
    return (
        <div
            className={`bg-gradient-to-br ${gradient} rounded p-4 flex items-center gap-4 cursor-pointer hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
        >
            <div className="w-16 h-16 bg-black/20 rounded"></div>
            <span className="font-bold">{title}</span>

            {/* Spotify Green Play Button - Slides up on hover */}
            <button className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <a href="#" className="text-sm font-semibold text-gray-400 hover:text-white">
                    Show all
                </a>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{children}</div>
        </section>
    );
}

function AlbumCard({ title, artist }: { title: string; artist: string }) {
    return (
        <div className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer group">
            <div className="w-full aspect-square bg-gray-700 rounded mb-4 relative">
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>
            <h3 className="font-bold truncate">{title}</h3>
            <p className="text-sm text-gray-400 truncate">{artist}</p>
        </div>
    );
}

function ArtistCard({ name }: { name: string }) {
    return (
        <div className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer group">
            <div className="w-full aspect-square bg-gray-700 rounded-full mb-4 relative">
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>
            <h3 className="font-bold truncate">{name}</h3>
            <p className="text-sm text-gray-400">Artist</p>
        </div>
    );
}

function BottomPlayer() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between max-w-full gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gray-700 rounded flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">Track Title</div>
                        <div className="text-xs text-gray-400 truncate">Artist Name</div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
                    <div className="flex items-center gap-4">
                        {/* Shuffle */}
                        <button className="text-gray-400 hover:text-white transition" title="Shuffle">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                            </svg>
                        </button>

                        {/* Previous */}
                        <button className="text-gray-400 hover:text-white transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>

                        {/* Next */}
                        <button className="text-gray-400 hover:text-white transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>

                        {/* Repeat */}
                        <button className="text-gray-400 hover:text-white transition" title="Repeat">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xl">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-10 text-right">0:00</span>
                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden group cursor-pointer relative">
                                <div className="h-full w-1/3 bg-gray-400 rounded-full group-hover:bg-[#1DB954] transition"></div>
                                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition -ml-1.5"></div>
                            </div>
                            <span className="w-10">3:24</span>
                        </div>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {/* Queue */}
                    <button className="text-gray-400 hover:text-white transition" title="Queue">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                    </button>

                    {/* Devices */}
                    <button className="text-gray-400 hover:text-white transition" title="Connect to a device">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
                        </svg>
                    </button>

                    {/* Volume */}
                    <button className="text-gray-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                    </button>
                    <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden group cursor-pointer relative">
                        <div className="h-full w-2/3 bg-gray-400 rounded-full group-hover:bg-white transition"></div>
                        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition -ml-1.5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
