import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAdminWorkQueue } from '@/hooks/useAdminWorkQueue';

/**
 * ⌘K / Ctrl-K navigation for the admin console.
 *
 * There are 48 admin destinations behind a sidebar that has to be scrolled and
 * scanned. Typing two letters is faster than remembering which section owns a
 * page — and where a destination has work waiting, its pending count is shown
 * inline so the palette doubles as a second view of the work queue.
 */

interface Destination {
  label: string;
  href: string;
  group: string;
  /** Extra words to match on that aren't in the label. */
  keywords?: string;
}

const DESTINATIONS: Destination[] = [
  { label: 'Dashboard', href: '/admin', group: 'Overview', keywords: 'home overview stats' },
  { label: 'Audit log', href: '/admin/audit-log', group: 'Overview', keywords: 'history actions' },
  { label: 'Revenue', href: '/admin/revenue', group: 'Overview', keywords: 'money coins earnings' },
  { label: 'Reports', href: '/admin/reports', group: 'Overview', keywords: 'analytics export' },

  { label: 'Verification requests', href: '/admin/verifications', group: 'Needs attention', keywords: 'verify kyc identity' },
  { label: 'Content reports', href: '/admin/content-reports', group: 'Needs attention', keywords: 'moderation abuse dmca takedown' },
  { label: 'Artist claims', href: '/admin/artist-claims', group: 'Needs attention', keywords: 'claim ownership music' },
  { label: 'Contact messages', href: '/admin/contact-messages', group: 'Needs attention', keywords: 'inbox enquiries support' },
  { label: 'Packages & advertising requests', href: '/admin/packages', group: 'Needs attention', keywords: 'business subscription payment advertise' },

  { label: 'Users', href: '/admin/users', group: 'People', keywords: 'accounts members' },
  { label: 'Admin management', href: '/admin/admin-management', group: 'People', keywords: 'roles permissions super admin' },
  { label: 'Gamification', href: '/admin/gamification', group: 'People', keywords: 'coins xp missions achievements economy' },

  { label: 'Marketplace ads', href: '/admin/marketplace', group: 'Marketplace', keywords: 'listings orders' },
  { label: 'Marketplace categories', href: '/admin/marketplace-categories', group: 'Marketplace', keywords: 'taxonomy' },

  { label: 'Businesses', href: '/admin/businesses', group: 'Directory', keywords: 'listings companies' },
  { label: 'Categories', href: '/admin/categories', group: 'Directory' },
  { label: 'Reviews', href: '/admin/reviews', group: 'Directory', keywords: 'ratings' },
  { label: 'Cities', href: '/admin/cities', group: 'Directory' },
  { label: 'Countries', href: '/admin/countries', group: 'Directory' },
  { label: 'Country info', href: '/admin/country-info', group: 'Directory' },
  { label: 'Country gallery', href: '/admin/country-gallery', group: 'Directory', keywords: 'images photos' },
  { label: 'Country key listings', href: '/admin/country-key-listings', group: 'Directory' },

  { label: 'Events', href: '/admin/events', group: 'Events', keywords: 'tickets registrations' },
  { label: 'Events slideshow', href: '/admin/events-slideshow', group: 'Events', keywords: 'carousel' },

  { label: 'Streams dashboard', href: '/admin/streams', group: 'Streams', keywords: 'music media' },
  { label: 'Artists', href: '/admin/streams/artists', group: 'Streams' },
  { label: 'Songs', href: '/admin/streams/songs', group: 'Streams', keywords: 'tracks music' },
  { label: 'Albums', href: '/admin/streams/albums', group: 'Streams' },
  { label: 'Podcasts', href: '/admin/streams/podcasts', group: 'Streams', keywords: 'episodes' },
  { label: 'Movies', href: '/admin/streams/movies', group: 'Streams', keywords: 'film video' },
  { label: 'Ebooks', href: '/admin/streams/ebooks', group: 'Streams', keywords: 'books reading' },
  { label: 'Content health', href: '/admin/streams/content-health', group: 'Streams', keywords: 'broken missing audit' },

  { label: 'Sports dashboard', href: '/admin/sports', group: 'Sports' },
  { label: 'Sports news', href: '/admin/sports/news', group: 'Sports' },
  { label: 'Sports videos', href: '/admin/sports/videos', group: 'Sports' },
  { label: 'Teams', href: '/admin/sports/teams', group: 'Sports' },
  { label: 'Leagues', href: '/admin/sports/leagues', group: 'Sports' },
  { label: 'Tournaments', href: '/admin/sports/tournaments', group: 'Sports' },

  { label: 'Blog posts', href: '/admin/blog', group: 'Content', keywords: 'articles' },
  { label: 'New blog post', href: '/admin/blog/new', group: 'Content', keywords: 'write create article' },
  { label: 'RSS feeds', href: '/admin/rss-feeds', group: 'Content', keywords: 'news sources' },

  { label: 'Sponsored ads', href: '/admin/sponsored-ads', group: 'Advertising' },
  { label: 'Sponsored banners', href: '/admin/sponsored-banners', group: 'Advertising' },
  { label: 'Banner ads', href: '/admin/banner-ads', group: 'Advertising' },
  { label: 'Popups', href: '/admin/popups', group: 'Advertising' },
  { label: 'Slideshow images', href: '/admin/slideshow-images', group: 'Advertising', keywords: 'carousel homepage' },

  { label: 'Email log', href: '/admin/email-log', group: 'System', keywords: 'queue sent delivery' },
  { label: 'Settings', href: '/admin/settings', group: 'System', keywords: 'profile clerk account' },
];

// Which work-queue key, if any, belongs to a destination — so a pending count
// can be shown next to it.
const QUEUE_BY_HREF: Record<string, string[]> = {
  '/admin/verifications': ['verifications'],
  '/admin/content-reports': ['content-reports'],
  '/admin/artist-claims': ['artist-claims'],
  '/admin/contact-messages': ['contact-messages'],
  '/admin/packages': ['packages', 'advertising'],
};

export const AdminCommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { items } = useAdminWorkQueue();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const countFor = (href: string): number => {
    const keys = QUEUE_BY_HREF[href];
    if (!keys) return 0;
    return keys.reduce(
      (sum, key) => sum + (items.find((i) => i.key === key)?.count ?? 0),
      0
    );
  };

  const groups = [...new Set(DESTINATIONS.map((d) => d.group))];

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label="Search admin pages">
      <CommandInput placeholder="Search admin pages…" />
      <CommandList>
        <CommandEmpty>No matching page.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {DESTINATIONS.filter((d) => d.group === group).map((d) => {
              const count = countFor(d.href);
              return (
                <CommandItem
                  key={d.href}
                  // cmdk matches on this string, so the keywords ride along
                  // invisibly — "kyc" finds Verification requests.
                  value={`${d.label} ${d.group} ${d.keywords ?? ''}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate(d.href);
                  }}
                >
                  <span className="flex-1">{d.label}</span>
                  {count > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-900 text-white text-[11px] font-bold">
                      {count}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
