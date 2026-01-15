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
          includedLanguages: 'en,fr,es,pt,sw,ar,rw',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );

      // Try to remove banner
      setTimeout(() => {
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner && banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
        document.body.style.top = '0';
        document.body.style.position = 'static';
      }, 500);
    };

    addScript();
  }, []);

  return <div id="google_translate_element"></div>;
};
