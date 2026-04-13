import { useEffect, useState } from 'react';
import { List, X } from 'lucide-react';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface BlogTableOfContentsProps {
  headings: TocHeading[];
}

export const BlogTableOfContents = ({ headings }: BlogTableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  if (headings.length === 0) return null;

  const list = (
    <nav aria-label="Table of contents">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 font-comfortaa">
        On This Page
      </h2>
      <ul className="space-y-1 text-sm font-roboto">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'ml-3' : ''}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block py-1 border-l-2 pl-3 transition-colors ${
                activeId === h.id
                  ? 'border-red-600 text-red-600 font-medium'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden xl:block fixed top-28 right-[max(1rem,calc((100vw-1280px)/2))] w-60 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4 z-30">
        {list}
      </aside>

      {/* Mobile/tablet: floating toggle + drawer */}
      <button
        onClick={() => setMobileOpen(true)}
        className="xl:hidden fixed bottom-20 right-4 z-30 bg-black text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Open table of contents"
      >
        <List className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="xl:hidden fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center sm:justify-center"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-comfortaa">
                Table of Contents
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
};
