import React, { createContext, useContext, useEffect, useState } from "react";

const backgrounds = [
  "/background/4cb4b4af788147056a9e506280818e3b.jpg",
  "/background/87b1d17bb072e98281415bf24e6abf99.jpg",
];

interface BackgroundContextType {
  currentBackground: string;
  setBackground: (bg: string) => void;
  availableBackgrounds: string[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined
);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  // Default to the first image
  const [currentBackground, setCurrentBackground] = useState<string>(() => {
    const saved = localStorage.getItem("profile_cover_image");
    return saved && backgrounds.includes(saved) ? saved : backgrounds[0];
  });

  useEffect(() => {
    localStorage.setItem("profile_cover_image", currentBackground);
    // Removed document.body style application
  }, [currentBackground]);

  return (
    <BackgroundContext.Provider
      value={{
        currentBackground,
        setBackground: setCurrentBackground,
        availableBackgrounds: backgrounds,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
