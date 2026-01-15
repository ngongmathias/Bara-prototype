import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'ar', name: 'العربية', flag: '🇦🇷' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' }
];

export const LanguageSelectorWithTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  const [isGoogleTranslateReady, setIsGoogleTranslateReady] = useState(false);

  useEffect(() => {
    // Load Google Translate script
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

    // Initialize Google Translate (hidden)
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,fr,es,pt,sw,ar,rw',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element_hidden'
      );

      // Remove banner
      setTimeout(() => {
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner && banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
        document.body.style.top = '0';
        document.body.style.position = 'static';
        setIsGoogleTranslateReady(true);
      }, 100);
    };

    addScript();

    return () => {
      const script = document.getElementById('google-translate-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const handleLanguageChange = (language: typeof languages[0]) => {
    setCurrentLanguage(language);
    setIsOpen(false);

    if (!isGoogleTranslateReady) {
      console.warn('Google Translate not ready yet');
      return;
    }

    // Trigger Google Translate by selecting the language in the hidden dropdown
    setTimeout(() => {
      const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleSelect) {
        googleSelect.value = language.code;
        googleSelect.dispatchEvent(new Event('change'));
      }
    }, 100);
  };

  return (
    <>
      {/* Hidden Google Translate widget */}
      <div id="google_translate_element_hidden" style={{ display: 'none' }}></div>

      {/* Custom UI */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="font-roboto flex items-center gap-1 sm:gap-2 hover:bg-gray-100 transition-colors duration-200 px-2 sm:px-3">
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
            <span className="hidden sm:inline text-xs sm:text-sm">{currentLanguage.code.toUpperCase()}</span>
            <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-40 sm:w-48 bg-background border border-border shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          sideOffset={8}
        >
          <div className="p-2">
            <h3 className="text-xs sm:text-sm font-roboto font-semibold text-yp-dark mb-2 px-2">
              Select Language
            </h3>
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`dropdown-menu-item-override font-roboto px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer button flex items-center gap-2 sm:gap-3 transition-all duration-200 ${
                  currentLanguage.code === language.code ? "bg-yp-gray-light text-yp-blue" : "text-yp-dark hover:bg-gray-100"
                }`}
              >
                <span className="text-base sm:text-lg">{language.flag}</span>
                <span className="text-xs sm:text-sm">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <span className="ml-auto text-yp-blue text-xs sm:text-sm">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
