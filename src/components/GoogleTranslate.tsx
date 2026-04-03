import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export const GoogleTranslate = () => {
  useEffect(() => {
    // Helper function to get cookie value
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    // Helper function to clear Google Translate cookies
    const clearGoogleTranslateCookies = () => {
      const cookies = ['googtrans', 'googtrans_backup'];
      const domains = [window.location.hostname, `.${window.location.hostname}`, ''];

      cookies.forEach(cookieName => {
        domains.forEach(domain => {
          if (domain) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
          }
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        });
      });
    };

    // Check if page is translated but shouldn't be (stale cookies)
    const currentLang = getCookie('googtrans');
    if (currentLang && currentLang !== '/en/en' && !document.querySelector('.goog-te-banner-frame')) {
      // Cookies exist but no active translation banner - clear stale cookies
      clearGoogleTranslateCookies();
      window.location.reload();
      return;
    }

    // Inject CSS to style the Google Translate widget
    if (!document.getElementById('google-translate-styles')) {
      const style = document.createElement('style');
      style.id = 'google-translate-styles';
      style.textContent = `
        /* Hide the Google Translate banner frame at the top of the page */
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }

        /* Container: remove all default styling */
        #google_translate_element .goog-te-gadget {
          font-size: 0 !important;
          line-height: 0 !important;
          color: transparent !important;
        }

        /* Hide "Powered by" text and Google logo */
        #google_translate_element .goog-te-gadget > span,
        #google_translate_element .goog-te-gadget > div,
        #google_translate_element .goog-logo-link,
        #google_translate_element .goog-te-gadget img {
          display: none !important;
        }

        /* Style the select dropdown to match the header buttons */
        #google_translate_element .goog-te-combo {
          display: inline-block !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          font-family: inherit !important;
          color: #1f2937 !important;
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
          height: 32px !important;
          cursor: pointer !important;
          outline: none !important;
          appearance: auto !important;
          -webkit-appearance: menulist !important;
          max-width: 120px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }

        #google_translate_element .goog-te-combo:hover {
          border-color: #d1d5db !important;
          background: #f9fafb !important;
        }

        #google_translate_element .goog-te-combo:focus {
          border-color: #9ca3af !important;
          box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.2) !important;
        }

        /* Tooltip popup styling override */
        .goog-tooltip, .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById('google-translate-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,fr,es,pt,sw,ar,rw,am,ha,ig,yo,zu,af,so,de,zh-CN,hi,ja,ko',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    addScript();

    // Fix for navbar staying translated when clicking "Show original"
    let previousLang = getCookie('googtrans');

    const checkInterval = setInterval(() => {
      const currentLang = getCookie('googtrans');

      if (previousLang && previousLang !== '/en/en' && (!currentLang || currentLang === '/en/en')) {
        clearGoogleTranslateCookies();
        setTimeout(() => window.location.reload(), 100);
      }

      previousLang = currentLang;
    }, 500);

    return () => clearInterval(checkInterval);
  }, []);

  return <div id="google_translate_element" className="inline-block" />;
};
