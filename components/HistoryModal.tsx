import React from 'react';
import { X, BookHeart } from 'lucide-react';
import type { BookRecommendationWithId } from '../types';
import GeneratedBookCover from './GeneratedBookCover';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BookRecommendationWithId[];
  isDarkMode: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-subtle-fade-in-up" 
      onClick={onClose}
      style={{ animationDuration: '0.3s' }}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl ${
            isDarkMode 
                ? 'bg-dawn-dark border border-border-dark' 
                : 'bg-lilac-sub border border-border-line'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-black/10" aria-label="Close history modal">
            <X className={`w-6 h-6 ${isDarkMode ? 'text-text-light/70' : 'text-text-dark/70'}`} />
        </button>
        <h2 className={`text-2xl font-title font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-text-light' : 'text-text-dark'}`}>
            <BookHeart className={isDarkMode ? 'text-gold-main' : 'text-lavender-main'} />
            나의 책 처방 기록
        </h2>
        {history.length === 0 ? (
            <div className="text-center py-16 opacity-70">
                <p className="font-bold">아직 추천받은 책이 없어요.</p>
                <p className="text-sm mt-2">나만의 책 처방전을 받아보세요!</p>
            </div>
        ) : (
            <div className="overflow-y-auto custom-scrollbar pr-2 -mr-4">
                <div className="space-y-3">
                    {history.map(book => (
                        <div key={book.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-blue-sub/30' : 'bg-white/70'}`}>
                            <GeneratedBookCover title={book.title} author={book.author} isbn={book.isbn} size="small" />
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold truncate ${isDarkMode ? 'text-text-light' : 'text-text-dark'}`}>{book.title}</h3>
                                <p className={`text-sm truncate opacity-80`}>{book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;