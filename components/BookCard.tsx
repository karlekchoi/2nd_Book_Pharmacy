import React from 'react';
import type { BookRecommendationWithId } from '../types';
import { Library, ExternalLink, Feather } from 'lucide-react';
import GeneratedBookCover from './GeneratedBookCover';

interface BookCardProps {
  book: BookRecommendationWithId;
  index: number;
  isDarkMode: boolean;
  selectedRegion: string;
  isLocationBased: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, index, isDarkMode, selectedRegion, isLocationBased }) => {
  console.log('📖 Book:', book.title, 'Cover Image:', book.coverImage); // 🔍 디버깅 로그!
  
  const animationDelayClass = `delay-${index * 150}`;
  const libraryRegionLabel = isLocationBased ? '내 주변' : selectedRegion;

  return (
    <div 
      className={`rounded-xl p-4 transition-all duration-300 hover:shadow-xl animate-subtle-fade-in-up ${animationDelayClass} ${
        isDarkMode 
          ? 'bg-dawn-dark/50 border border-border-dark hover:border-gold-main/50' 
          : 'bg-white/80 border border-border-line hover:border-lavender-main/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          {/* 🔥 썸네일 표시 부분 */}
          {book.coverImage ? (
            // 알라딘 이미지가 있으면 실제 이미지 표시
            <img 
              src={book.coverImage} 
              alt={`${book.title} 표지`}
              className="w-32 h-48 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                // 이미지 로딩 실패하면 GeneratedBookCover로 대체
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {/* 백업용: 알라딘 이미지 없거나 실패하면 기존 GeneratedBookCover 표시 */}
          <div className={book.coverImage ? 'hidden' : ''}>
            <GeneratedBookCover title={book.title} author={book.author} isbn={book.isbn} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 text-left sm:text-left text-center">
          <h3 className="font-title font-bold text-lg mb-1">{book.title}</h3>
          <p className="text-sm opacity-80 mb-3">{book.author} · {book.publisher}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
            {book.vibe.map((tag, idx) => (
              <span key={idx} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isDarkMode ? 'bg-gold-main/10 text-gold-main' : 'bg-lavender-main/10 text-lavender-main'}`}>#{tag}</span>
            ))}
          </div>
          
          <p className="text-sm italic opacity-90 mb-4">"{book.description}"</p>
          
          <div className={`p-3 rounded-lg mb-4 text-sm ${isDarkMode ? 'bg-blue-sub/30' : 'bg-lilac-sub'}`}>
            <p className="font-semibold flex items-start gap-2">
              <Feather className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gold-main' : 'text-lavender-main'}`} />
              <span><span className="font-bold">AI's Note:</span> {book.aiReason}</span>
            </p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-bold mb-2 flex items-center gap-1.5 justify-center sm:justify-start">
              <Library className="w-4 h-4" />{libraryRegionLabel} 도서관 현황
            </p>
            <div className="space-y-1 text-xs">
              {book.libraries.map((lib, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-md ${isDarkMode ? 'bg-dawn-dark/60' : 'bg-white/80'}`}>
                  <span className="font-semibold truncate pr-2">{lib.name}</span>
                  {lib.available ? (
                    <span className="flex items-center gap-1 text-green-500 dark:text-green-400 font-bold flex-shrink-0">✓ 대여 가능 {lib.distance && `(${lib.distance})`}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-bold flex-shrink-0">◷ 대기 {lib.waitlist}명</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 text-xs flex-wrap justify-center sm:justify-start">
            <a href={book.purchaseLinks.yes24} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors ${isDarkMode ? 'bg-blue-sub/40 hover:bg-blue-sub/70' : 'bg-lilac-sub hover:bg-border-line'}`}>
              <ExternalLink className="w-3 h-3" />YES24
            </a>
            <a href={book.purchaseLinks.kyobo} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors ${isDarkMode ? 'bg-blue-sub/40 hover:bg-blue-sub/70' : 'bg-lilac-sub hover:bg-border-line'}`}>
              <ExternalLink className="w-3 h-3" />교보문고
            </a>
            <a href={book.purchaseLinks.aladin} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-colors ${isDarkMode ? 'bg-blue-sub/40 hover:bg-blue-sub/70' : 'bg-lilac-sub hover:bg-border-line'}`}>
              <ExternalLink className="w-3 h-3" />알라딘
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;