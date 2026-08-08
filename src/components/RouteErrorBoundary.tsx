import { Component, ErrorInfo, ReactNode } from 'react';
import { attemptChunkReload, isChunkLoadError } from '@/lib/chunkReload';

interface Props {
  children: ReactNode;
  /** Shown in the fallback copy, e.g. "the marketplace". Keep it lowercase. */
  section?: string;
}

interface State {
  hasError: boolean;
  isStaleChunk: boolean;
}

/**
 * A per-section boundary that sits *inside* the app shell.
 *
 * The top-level <ErrorBoundary> in App.tsx replaces the entire page, header and
 * all, whenever anything throws. That is far too blunt now that most routes are
 * code-split: one broken admin page should not blank the site. This boundary
 * wraps a route group so a failure is contained to the content area and the
 * user can still navigate away.
 *
 * It also distinguishes the single most common lazy-loading failure — a stale
 * chunk after a deploy — from a genuine bug, because the two need opposite
 * responses: reload vs. don't-bother-reloading.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, isStaleChunk: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, isStaleChunk: isChunkLoadError(error) };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isChunkLoadError(error)) {
      // A new build is live and this tab is holding the old chunk names.
      // Reloading fixes it silently; if we already tried, fall through to the
      // manual prompt rendered below rather than looping.
      attemptChunkReload();
      return;
    }
    console.error(`RouteErrorBoundary (${this.props.section ?? 'route'}) caught:`, error, errorInfo);
  }

  private handleRetry = () => {
    // A stale chunk can only be resolved by re-fetching index.html; a render
    // bug might clear on a remount, but reloading is the honest, reliable
    // option for both and avoids pretending we recovered when we did not.
    window.location.reload();
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    const { isStaleChunk } = this.state;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-white">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-comfortaa font-semibold text-gray-900 mb-2">
            {isStaleChunk ? 'A new version of BARA is available' : 'This section failed to load'}
          </h2>
          <p className="text-sm font-roboto text-gray-600 mb-6 leading-relaxed">
            {isStaleChunk
              ? 'The site was updated while this page was open. Reload to get the latest version.'
              : `Something went wrong loading ${this.props.section ?? 'this page'}. The rest of the site is still working — you can go back, or try again.`}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
