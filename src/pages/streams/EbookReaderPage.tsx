import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader } from 'react-reader';
import type { Rendition } from 'epubjs';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, BookOpen } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface Ebook {
    id: string;
    title: string;
    author: string;
    file_url: string | null;
    cover_url: string;
    is_free: boolean;
}

type Format = 'pdf' | 'epub';

function detectFormat(url: string): Format {
    return url.toLowerCase().includes('.epub') ? 'epub' : 'pdf';
}

export default function EbookReaderPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: clerkUser } = useUser();

    const [ebook, setEbook] = useState<Ebook | null>(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const [epubLocation, setEpubLocation] = useState<string | number | null>(null);
    const [fontSizePercent, setFontSizePercent] = useState(100);
    const renditionRef = useRef<Rendition | null>(null);
    const hasRecordedRead = useRef(false);
    const resumeAppliedRef = useRef(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        supabase.from('ebooks').select('id, title, author, file_url, cover_url, is_free').eq('id', id).maybeSingle()
            .then(({ data }) => { setEbook(data); setLoading(false); });
    }, [id]);

    // Resume: load saved progress once the ebook (and thus its format) is known.
    useEffect(() => {
        if (!ebook || !ebook.file_url || !clerkUser?.id || resumeAppliedRef.current) return;
        resumeAppliedRef.current = true;
        const format = detectFormat(ebook.file_url);
        supabase
            .from('ebook_reading_progress')
            .select('location, completed')
            .eq('user_id', clerkUser.id)
            .eq('ebook_id', ebook.id)
            .maybeSingle()
            .then(({ data }) => {
                if (!data || data.completed || !data.location) return;
                if (format === 'pdf') {
                    const page = parseInt(data.location, 10);
                    if (!isNaN(page) && page > 0) setPageNumber(page);
                } else {
                    setEpubLocation(data.location);
                }
            });
    }, [ebook, clerkUser?.id]);

    const recordRead = async () => {
        if (hasRecordedRead.current || !ebook) return;
        hasRecordedRead.current = true;
        try { await supabase.rpc('record_ebook_read', { p_ebook_id: ebook.id }); } catch { /* non-blocking */ }
    };

    const saveProgress = async (location: string, format: Format, progressPercent: number, completed = false) => {
        if (!clerkUser?.id || !ebook) return;
        try {
            await supabase.from('ebook_reading_progress').upsert({
                user_id: clerkUser.id,
                ebook_id: ebook.id,
                format,
                location,
                progress_percent: Math.min(100, Math.max(0, progressPercent)),
                completed,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,ebook_id' });
        } catch { /* non-blocking */ }
    };

    const handlePdfLoadSuccess = ({ numPages: n }: { numPages: number }) => {
        setNumPages(n);
        recordRead();
    };

    const goToPage = (page: number) => {
        const clamped = Math.min(Math.max(1, page), numPages || 1);
        setPageNumber(clamped);
        saveProgress(String(clamped), 'pdf', numPages ? (clamped / numPages) * 100 : 0, numPages > 0 && clamped === numPages);
    };

    const handleEpubLocationChanged = (cfi: string) => {
        setEpubLocation(cfi);
        recordRead();
        let percent = 0;
        try {
            const rendition = renditionRef.current;
            if (rendition?.book?.locations && (rendition.book.locations as any).length()) {
                percent = (rendition.book.locations as any).percentageFromCfi(cfi) * 100;
            }
        } catch { /* locations not generated yet */ }
        saveProgress(cfi, 'epub', percent);
    };

    const getRendition = (rendition: Rendition) => {
        renditionRef.current = rendition;
        rendition.themes.fontSize(`${fontSizePercent}%`);
        rendition.book.ready.then(() => {
            (rendition.book.locations as any).generate(1000).catch(() => {});
        });
    };

    const adjustEpubFontSize = (delta: number) => {
        const next = Math.min(200, Math.max(70, fontSizePercent + delta));
        setFontSizePercent(next);
        renditionRef.current?.themes.fontSize(`${next}%`);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!ebook) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
                <p className="text-gray-600">Ebook not found.</p>
                <button onClick={() => navigate('/streams/ebooks')} className="underline text-sm text-gray-500">Back to Ebooks</button>
            </div>
        );
    }

    if (!ebook.is_free) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50 text-center px-6">
                <BookOpen className="w-12 h-12 text-gray-300" />
                <h1 className="text-xl font-bold text-gray-900">Paid ebooks are coming soon</h1>
                <p className="text-gray-500 max-w-sm">Payments for paid titles aren't live yet — check back soon.</p>
                <button onClick={() => navigate(`/streams/ebook/${ebook.id}`)} className="mt-2 bg-gray-900 text-white font-bold px-5 py-2.5 rounded-lg text-sm">Back to {ebook.title}</button>
            </div>
        );
    }

    if (!ebook.file_url) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-3 z-50 text-center px-6">
                <BookOpen className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500">No file available for this title yet.</p>
                <button onClick={() => navigate(`/streams/ebook/${ebook.id}`)} className="underline text-sm text-gray-500">Back to {ebook.title}</button>
            </div>
        );
    }

    const format = detectFormat(ebook.file_url);

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10">
                <button onClick={() => navigate(`/streams/ebook/${ebook.id}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm min-w-0">
                    <ArrowLeft className="w-5 h-5 flex-shrink-0" /> <span className="truncate">{ebook.title}</span>
                </button>

                {format === 'pdf' ? (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-600">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-500 font-medium">Page {pageNumber} of {numPages || '…'}</span>
                        <button onClick={() => goToPage(pageNumber + 1)} disabled={numPages > 0 && pageNumber >= numPages} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-600">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200" />
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"><ZoomOut className="w-4 h-4" /></button>
                        <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"><ZoomIn className="w-4 h-4" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">Text size</span>
                        <button onClick={() => adjustEpubFontSize(-10)} className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-600 text-xs font-bold">A-</button>
                        <button onClick={() => adjustEpubFontSize(10)} className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-bold">A+</button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto relative">
                {format === 'pdf' ? (
                    <div className="flex justify-center py-6">
                        <Document
                            file={ebook.file_url}
                            onLoadSuccess={handlePdfLoadSuccess}
                            loading={<Loader2 className="w-8 h-8 animate-spin text-gray-400 mt-20" />}
                            error={<p className="text-gray-500 mt-20">Failed to load this PDF.</p>}
                        >
                            <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer renderTextLayer />
                        </Document>
                    </div>
                ) : (
                    <ReactReader
                        url={ebook.file_url}
                        location={epubLocation}
                        locationChanged={handleEpubLocationChanged}
                        getRendition={getRendition}
                        showToc
                    />
                )}
            </div>
        </div>
    );
}
