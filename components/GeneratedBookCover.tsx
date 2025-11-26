import React, { useState, useEffect } from 'react';

// Simple string hash to generate a number for deterministic generation.
const stringToHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A curated list of beautiful, harmonious color palettes.
const colorPalettes = [
  { from: '#ff9a9e', to: '#fecfef', text: '#5e3449' }, // Cotton Candy
  { from: '#a1c4fd', to: '#c2e9fb', text: '#2c3e50' }, // Gentle Sky
  { from: '#84fab0', to: '#8fd3f4', text: '#13547a' }, // Ocean Mist
  { from: '#f6d365', to: '#fda085', text: '#8c520a' }, // Warm Sunset
  { from: '#d4fc79', to: '#96e6a1', text: '#2c522c' }, // Fresh Lime
  { from: '#c3a3f4', to: '#fbc2eb', text: '#4a2c52' }, // Lavender Dream
  { from: '#fccb90', to: '#d57eeb', text: '#522c4a' }, // Soft Peach
  { from: '#48c6ef', to: '#6f86d6', text: '#073352' }, // Deep Ocean
  { from: '#ff758c', to: '#ff7eb3', text: '#6d1839' }, // Raspberry Fizz
  { from: '#56ab2f', to: '#a8e063', text: '#193a0d' }, // Lush Meadow
  { from: '#30cfd0', to: '#330867', text: '#ffffff' }, // Galaxy Night
  { from: '#20002c', to: '#cbb4d4', text: '#ffffff' }, // Royal Amethyst
  { from: '#1e3c72', to: '#2a5298', text: '#ffffff' }, // Starry Night
  { from: '#ffdde1', to: '#ee9ca7', text: '#7d3c47' }, // Rose Petals
  { from: '#00c3ff', to: '#ffff1c', text: '#004c66' }, // Electric Pop
];

// Abstract SVG patterns for background texture
const patterns = [
  // Plus signs
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M2 9h6V3h2v6h6v2H10v6H8V11H2V9z'/%3E%3C/svg%3E")`,
  // Dots
  `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  // Zigzag
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M0 0h20L0 20zM20 20H0L20 0z'/%3E%3C/svg%3E")`,
  // Diagonal lines
  `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%239C92AC' stroke-width='1' fill='none' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
];

interface GeneratedBookCoverProps {
  title: string;
  author: string;
  isbn: string;
  size?: 'small' | 'large';
}

const GeneratedBookCover: React.FC<GeneratedBookCoverProps> = ({ title, author, isbn, size = 'large' }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(!isbn);
  const [isLoaded, setIsLoaded] = useState(false);

  const coverSources = isbn ? [
    `https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/${isbn}.jpg`,
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
  ] : [];
  
  useEffect(() => {
    setSourceIndex(0);
    setUseFallback(!isbn);
    setIsLoaded(false);
  }, [isbn, title]);

  const handleError = () => {
    if (sourceIndex < coverSources.length - 1) {
      setIsLoaded(false);
      setSourceIndex(sourceIndex + 1);
    } else {
      setUseFallback(true);
    }
  };
  
  const containerClasses = size === 'large' 
    ? "w-28 h-40 rounded-xl shadow-xl" 
    : "w-14 h-20 rounded-md shadow-md flex-shrink-0";

  if (useFallback) {
    // Original fallback generation logic
    const hash = stringToHash(title + author);
    const palette = colorPalettes[hash % colorPalettes.length];
    const pattern = patterns[hash % patterns.length];
    const titleClass = size === 'large' ? 'text-base' : 'text-[10px]';
    const authorClass = size === 'large' ? 'text-xs' : 'text-[8px]';
    const paddingClass = size === 'large' ? 'p-3' : 'p-2';

    return (
      <div 
          className={`relative ${containerClasses} ${paddingClass} flex flex-col justify-end overflow-hidden transition-transform hover:scale-105`}
          style={{
              background: `radial-gradient(circle, ${palette.from} 0%, ${palette.to} 100%)`,
              color: palette.text,
          }}
      >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: pattern,
              backgroundSize: '15px 15px',
              opacity: 0.2,
            }}
          />
          <div className="relative z-10">
            <h3 className={`font-bold leading-tight ${titleClass}`}>{title}</h3>
            <p className={`mt-1 opacity-80 ${authorClass}`}>{author}</p>
          </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClasses} bg-gray-200 dark:bg-gray-800/50 overflow-hidden transition-transform hover:scale-105`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
      )}
      <img
        src={coverSources[sourceIndex]}
        alt={`${title} book cover`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </div>
  );
};

export default GeneratedBookCover;