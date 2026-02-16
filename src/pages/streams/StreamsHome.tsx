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
        <aside className="w-64 bg-black p-6 flex flex-col gap-6">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
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

            <div className="flex-1">
                <h3 className="text-gray-400 text-sm font-semibold mb-4">Your Library</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Create your first playlist</h4>
                    <p className="text-sm text-gray-400 mb-4">It's easy, we'll help you</p>
                    <button className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:scale-105 transition">
                        Create playlist
                    </button>
                </div>
            </div>

            <div className="text-xs text-gray-400 space-y-2">
                <a href="#" className="hover:text-white">Legal</a>
                <a href="#" className="hover:text-white">Privacy Center</a>
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Cookies</a>
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
            className={`bg-gradient-to-br ${gradient} rounded p-4 flex items-center gap-4 cursor-pointer hover:scale-105 transition group`}
        >
            <div className="w-16 h-16 bg-black/20 rounded"></div>
            <span className="font-bold">{title}</span>
            <button className="ml-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="flex items-center justify-between max-w-full">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-14 h-14 bg-gray-700 rounded"></div>
                    <div>
                        <div className="font-semibold text-sm">Track Title</div>
                        <div className="text-xs text-gray-400">Artist Name</div>
                    </div>
                    <button className="ml-2 text-gray-400 hover:text-white">♡</button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-white">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                        <button className="text-gray-400 hover:text-white">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full max-w-xl">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>0:00</span>
                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-white rounded-full"></div>
                            </div>
                            <span>3:24</span>
                        </div>
                    </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <button className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                    </button>
                    <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
