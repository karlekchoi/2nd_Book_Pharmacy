import React from 'react';
import { BookOpen, AlertTriangle } from 'lucide-react';
import BookCard from './BookCard';
import type { BookRecommendationWithId } from '../types';

interface RecommendationsProps {
  recommendations: BookRecommendationWithId[];
  isDarkMode: boolean;
  selectedRegion: string;
  error: string | null;
  isLocationBased: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations, isDarkMode, selectedRegion, error, isLocationBased }) => {
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className={`rounded-2xl backdrop-blur-md p-6 transition-all duration-500 animate-subtle-fade-in-up lg:flex lg:flex-col ${
      isDarkMode 
        ? 'bg-blue-sub/20 border border-border-dark' 
        : 'bg-white/40 border border-border-line'
    }`}>
      <h2 className={`text-2xl font-title font-bold mb-6 flex items-center gap-2 lg:flex-shrink-0 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        <span className={isDarkMode ? 'text-gold-main' : 'text-lavender-main'}>&#10022;</span>
        당신을 위한 책 처방전
      </h2>
      
      {error && (
        <div className={`text-center py-12 rounded-lg flex-grow flex flex-col items-center justify-center ${isDarkMode ? 'bg-dawn-dark/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="text-lg font-bold mb-2">오류가 발생했어요</p>
            <p className="text-sm px-4">{error}</p>
        </div>
      )}

      {!error && !hasRecommendations && (
        <div className={`text-center py-12 flex-grow flex flex-col items-center justify-center ${isDarkMode ? 'text-text-light/60' : 'text-text-dark/60'}`}>
          <BookOpen className="w-16 h-16 mb-6 opacity-50" />
          <p className="text-lg font-bold mb-2">당신의 이야기를 기다리고 있어요</p>
          <p className="text-sm">왼쪽 폼을 작성하고<br/>당신만의 책을 추천받아 보세요.</p>
        </div>
      )}
      
      {!error && hasRecommendations && (
        <div className="space-y-4 max-h-[85vh] lg:max-h-none lg:flex-grow lg:min-h-0 overflow-y-auto custom-scrollbar pr-2 -mr-4">
          {recommendations.map((book, index) => (
            <BookCard 
              key={book.id} 
              book={book} 
              index={index} 
              isDarkMode={isDarkMode}
              selectedRegion={selectedRegion}
              isLocationBased={isLocationBased}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;