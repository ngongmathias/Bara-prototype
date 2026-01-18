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
      
      // Don't hide the banner - it's needed for translation to work properly
    };

    addScript();

    // Fix for navbar staying translated when clicking "Show original"
    // Monitor Google Translate cookie to detect language changes
    let previousLang = getCookie('googtrans');
    
    const checkInterval = setInterval(() => {
      const currentLang = getCookie('googtrans');
      
      // If language changed from something to empty/null (Show original clicked)
      if (previousLang && previousLang !== '/en/en' && (!currentLang || currentLang === '/en/en')) {
        // Reload page to ensure everything reverts to English
        window.location.reload();
      }
      
      previousLang = currentLang;
    }, 500);

    // Cleanup interval on unmount
    return () => clearInterval(checkInterval);
  }, []);

  // Helper function to get cookie value
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  return <div id="google_translate_element"></div>;
};
