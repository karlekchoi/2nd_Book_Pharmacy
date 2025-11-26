import React from 'react';
import { RefreshCw, LocateFixed, BookMarked, Loader2, Send } from 'lucide-react';
import { regions } from '../constants';
import type { UserInput } from '../types';

interface InputFormProps {
  userInput: UserInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserInput>>;
  selectedRegion: string;
  setSelectedRegion: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleRegenerate: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  activeStep: number;
  searchNationwide: boolean;
  setSearchNationwide: React.Dispatch<React.SetStateAction<boolean>>;
  showRegenerate: boolean;
  handleLocationClick: () => void;
  isLocating: boolean;
  userLocation: { latitude: number, longitude: number } | null;
}

const steps = [
  { name: '정보 입력' },
  { name: 'AI 추천 중' },
  { name: '추천 완료' },
];

const InputForm: React.FC<InputFormProps> = ({
  userInput,
  setUserInput,
  selectedRegion,
  setSelectedRegion,
  handleSubmit,
  handleRegenerate,
  isLoading,
  isDarkMode,
  activeStep,
  searchNationwide,
  setSearchNationwide,
  showRegenerate,
  handleLocationClick,
  isLocating,
  userLocation,
}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setUserInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle = `w-full p-3 rounded-lg border transition-all duration-300 shadow-inner ${
    isDarkMode 
      ? 'bg-dawn-dark/60 border-border-dark text-text-light placeholder:text-text-light/50 focus:border-gold-main/70 focus:ring-1 focus:ring-gold-main/50' 
      : 'bg-white/80 border-border-line text-text-dark placeholder:text-text-dark/50 focus:border-lavender-main/70 focus:ring-1 focus:ring-lavender-main/50'
  } outline-none`;

  const moodOptions = ['행복함', '우울함', '지루함', '화남', '편안함', '생각이 많음', '불안함'];

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-md transition-colors duration-500 shadow-lg animate-subtle-fade-in-up ${
      isDarkMode 
        ? 'bg-blue-sub/20 border border-border-dark' 
        : 'bg-white/40 border border-border-line'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-title font-bold flex items-center gap-2">
          <BookMarked className={isDarkMode ? 'text-gold-main' : 'text-lavender-main'}/>
          책 처방전 작성하기
        </h2>
        {showRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${
                isDarkMode 
                  ? 'bg-blue-sub/50 text-gold-main hover:bg-blue-sub/80'
                  : 'bg-lilac-sub text-lavender-main hover:bg-border-line'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              다른 처방전
            </button>
        )}
      </div>

      <div className="relative pt-1 mb-8">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-border-line dark:bg-border-dark">
          <div style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${isDarkMode ? 'bg-gold-main' : 'bg-lavender-main'}`}></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="mood" className="block text-sm font-semibold mb-2">지금 기분은 어떠신가요? *</label>
          <select id="mood" name="mood" value={userInput.mood} onChange={handleChange} className={inputStyle} required>
            <option value="" disabled>-- 기분을 선택해주세요 --</option>
            {moodOptions.map(mood => <option key={mood} value={mood}>{mood}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="situation" className="block text-sm font-semibold mb-2">어떤 상황에 처해있나요?</label>
          <textarea id="situation" name="situation" value={userInput.situation} onChange={handleChange} placeholder="예: 새로운 시작을 앞두고 있어요." className={`${inputStyle} h-24`} />
        </div>
        
        <div>
          <label htmlFor="genre" className="block text-sm font-semibold mb-2">선호하는 장르가 있나요? (선택)</label>
          <input id="genre" type="text" name="genre" value={userInput.genre} onChange={handleChange} placeholder="예: SF, 에세이, 추리소설" className={inputStyle} />
        </div>
        
        <div>
          <label htmlFor="purpose" className="block text-sm font-semibold mb-2">독서를 통해 무엇을 얻고 싶으신가요?</label>
          <input id="purpose" type="text" name="purpose" value={userInput.purpose} onChange={handleChange} placeholder="예: 마음의 위로, 새로운 지식" className={inputStyle} />
        </div>

        <div className="space-y-3 pt-4 border-t border-border-line dark:border-border-dark">
          <label className="block text-sm font-semibold">도서관 검색 지역 (선택)</label>
          <div className="flex items-center gap-2">
            <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={searchNationwide || !!userLocation}
                className={`${inputStyle} flex-grow`}
            >
                {regions.map(region => (
                    <option key={region.name} value={region.name}>{region.emoji} {region.name}</option>
                ))}
            </select>
            <button
                type="button"
                onClick={handleLocationClick}
                disabled={isLocating}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-blue-sub/50 hover:bg-blue-sub/80' : 'bg-lilac-sub hover:bg-border-line'}`}
            >
                {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={searchNationwide} onChange={() => setSearchNationwide(!searchNationwide)} disabled={!!userLocation} className="w-4 h-4 rounded text-lavender-main dark:text-gold-main bg-lilac-sub dark:bg-blue-sub border-border-line dark:border-border-dark focus:ring-lavender-main dark:focus:ring-gold-main" />
              <span className="ml-2 text-sm">전국에서 찾기</span>
            </label>
            {userLocation && (
              <p className="text-xs text-green-600 dark:text-green-400">✓ 현재 위치로 검색합니다.</p>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${
            isDarkMode
              ? 'bg-gold-main text-dawn-dark shadow-gold-main/20'
              : 'bg-lavender-main text-white shadow-lavender-main/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              AI가 책을 고르는 중...
            </>
          ) : (
            <>
              책 처방받기
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;