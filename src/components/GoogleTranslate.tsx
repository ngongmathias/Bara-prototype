import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export const GoogleTranslate = () => {
  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr,es,pt,sw,ar,rw', // Languages you want to support
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // Forcefully remove the Google Translate top banner
        const removeGoogleBar = () => {
          const googleBar = document.querySelector('.goog-te-banner-frame');
          if (googleBar) {
            googleBar.remove();
          }
          
          // Also remove the iframe
          const iframes = document.querySelectorAll('iframe.goog-te-banner-frame');
          iframes.forEach(iframe => iframe.remove());
          
          // Reset body top position
          document.body.style.top = '0';
          document.body.style.position = 'static';
        };

        // Run immediately and also after a delay to catch late additions
        removeGoogleBar();
        setTimeout(removeGoogleBar, 100);
        setTimeout(removeGoogleBar, 500);
        setTimeout(removeGoogleBar, 1000);

        // Watch for changes and remove the bar if it appears
        const observer = new MutationObserver(() => {
          removeGoogleBar();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    };

    // Check if script already exists
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      addScript();
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement) {
        translateElement.innerHTML = '';
      }
    };
  }, []);

  return (
    <div id="google_translate_element" className="inline-block google-translate-container" />
  );
};
