import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    googleTranslateInitialized?: boolean;
  }
}

// This component initializes Google Translate once globally
export const GlobalGoogleTranslate = () => {
  useEffect(() => {
    // Only initialize once
    if (window.googleTranslateInitialized) {
      return;
    }

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

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,fr,es,pt,sw,ar,rw',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );

      // Mark as initialized
      window.googleTranslateInitialized = true;

      // Remove banner with multiple attempts
      const removeBanner = () => {
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner && banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
        document.body.style.top = '0px';
        document.body.style.position = 'static';
      };

      setTimeout(removeBanner, 100);
      setTimeout(removeBanner, 500);
      setTimeout(removeBanner, 1000);
    };

    addScript();
  }, []);

  // Single hidden container for the widget
  return <div id="google_translate_element" style={{ display: 'none' }}></div>;
};

// Component that just shows the dropdown (references the global widget)
export const GoogleTranslateDropdown = () => {
  return (
    <div className="google-translate-dropdown-container">
      {/* The actual widget is rendered by GlobalGoogleTranslate */}
      {/* This is just a placeholder that Google will populate */}
    </div>
  );
};
