import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export interface SelectedCountry {
  id: string;
  name: string;
  code: string;
  flag_url?: string | null;
  flag_emoji?: string;
}

interface CountrySelectionContextValue {
  selectedCountry: SelectedCountry | null;
  setSelectedCountry: (country: SelectedCountry | null) => void;
  clearSelectedCountry: () => void;
}

const CountrySelectionContext = createContext<CountrySelectionContextValue | undefined>(undefined);

const STORAGE_KEY = 'bara_selected_country';

export const CountrySelectionProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from localStorage
  const [selectedCountry, setSelectedCountryState] = useState<SelectedCountry | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading selected country from localStorage:', error);
      return null;
    }
  });

  // Persist to localStorage whenever country changes
  const setSelectedCountry = (country: SelectedCountry | null) => {
    setSelectedCountryState(country);
    try {
      if (country) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(country));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving selected country to localStorage:', error);
    }
  };

  const clearSelectedCountry = () => {
    setSelectedCountry(null);
  };

  const value = useMemo(() => ({
    selectedCountry,
    setSelectedCountry,
    clearSelectedCountry,
  }), [selectedCountry]);

  return (
    <CountrySelectionContext.Provider value={value}>
      {children}
    </CountrySelectionContext.Provider>
  );
};

export const useCountrySelection = (): CountrySelectionContextValue => {
  const ctx = useContext(CountrySelectionContext);
  if (!ctx) {
    throw new Error('useCountrySelection must be used within a CountrySelectionProvider');
  }
  return ctx;
};


