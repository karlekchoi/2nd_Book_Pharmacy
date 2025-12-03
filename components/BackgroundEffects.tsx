
import React from 'react';
import { BookOpen, Stars, Coffee } from 'lucide-react';

interface BackgroundEffectsProps {
  isDarkMode: boolean;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-20 left-10 animate-float">
        <Stars className={`w-8 h-8 ${isDarkMode ? 'text-yellow-300' : 'text-purple-300'} opacity-60`} />
      </div>
      <div className="absolute top-40 right-20 animate-float-delayed">
        <Coffee className={`w-10 h-10 ${isDarkMode ? 'text-pink-300' : 'text-pink-400'} opacity-50`} />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float">
        <BookOpen className={`w-12 h-12 ${isDarkMode ? 'text-blue-300' : 'text-blue-400'} opacity-40`} />
      </div>
    </div>
  );
};

export default BackgroundEffects;
