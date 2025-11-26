import React from 'react';
import { BookText, Sun, Moon, Library } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  historyCount: number;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, historyCount, onHistoryClick }) => {
  return (
    <header className="flex justify-between items-center mb-6 pb-6 border-b border-border-line dark:border-border-dark">
      <div className="flex items-center gap-3">
        <BookText className={`w-9 h-9 ${isDarkMode ? 'text-gold-main' : 'text-lavender-main'}`} />
        <div>
          <h1 className="text-3xl md:text-4xl font-title font-bold text-text-dark dark:text-text-light">
            종이약국
          </h1>
          <p className="text-sm md:text-base text-text-dark/70 dark:text-text-light/70">
            당신의 마음을 위한 서재
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onHistoryClick}
          className={`relative p-3 rounded-full transition-colors ${ isDarkMode ? 'text-gold-main/80 hover:bg-blue-sub' : 'text-lavender-main/80 hover:bg-lilac-sub' }`}
          aria-label="추천 히스토리 보기"
        >
          <Library className="w-5 h-5" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {historyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-full transition-colors ${
            isDarkMode 
              ? 'text-yellow-300 hover:bg-blue-sub' 
              : 'text-gray-700 hover:bg-lilac-sub'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;