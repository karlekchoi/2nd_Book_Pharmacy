import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Recommendations from './components/Recommendations';
import HistoryModal from './components/HistoryModal';
import getBookRecommendations from './services/geminiService';
import type { UserInput, BookRecommendation, BookRecommendationWithId } from './types';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    mood: '',
    situation: '',
    genre: '',
    purpose: ''
  });
  
  const [selectedRegion, setSelectedRegion] = useState<string>('서울');
  const [recommendations, setRecommendations] = useState<BookRecommendationWithId[]>([]);
  const [recommendationHistory, setRecommendationHistory] = useState<BookRecommendationWithId[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [searchNationwide, setSearchNationwide] = useState<boolean>(false);
  const [showRegenerate, setShowRegenerate] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);


  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchRecommendations = async (excludeTitles: string[] = []) => {
    setIsLoading(true);
    setActiveStep(1);
    setError(null);
    setRecommendations([]);

    const effectiveRegion = searchNationwide ? '대한민국 전국 주요 도시' : selectedRegion;

    try {
      const results = await getBookRecommendations(userInput, effectiveRegion, excludeTitles, userLocation);
      const resultsWithIds: BookRecommendationWithId[] = results.map(book => ({
        ...book,
        id: `${book.title}-${book.author}-${book.isbn}`
      }));
      setRecommendations(resultsWithIds);
      
      setRecommendationHistory(prevHistory => {
        const newBooks = resultsWithIds.filter(newBook => 
          !prevHistory.some(existingBook => existingBook.id === newBook.id)
        );
        return [...prevHistory, ...newBooks];
      });

      setActiveStep(2);
      setShowRegenerate(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      setActiveStep(0);
      setShowRegenerate(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.mood) {
      alert('현재 기분을 선택해주세요.');
      return;
    }
    fetchRecommendations();
  };

  const handleRegenerate = () => {
    if (!userInput.mood) {
      alert('현재 기분을 선택해주세요.');
      return;
    }
    const titlesToExclude = recommendationHistory.map(b => b.title);
    fetchRecommendations(titlesToExclude);
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 서비스를 지원하지 않아요.");
      return;
    }
    
    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setSearchNationwide(false);
        setIsLocating(false);
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        let errorMessage = "위치 정보를 가져오는 데 실패했어요. ";
        switch(geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage += "위치 정보 접근 권한을 허용해주세요.";
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage += "현재 위치를 확인할 수 없어요.";
            break;
          case geoError.TIMEOUT:
            errorMessage += "요청 시간이 초과되었어요.";
            break;
          default:
            errorMessage += "알 수 없는 오류가 발생했습니다.";
            break;
        }
        setError(errorMessage);
        setUserLocation(null);
        setIsLocating(false);
      }
    );
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-500 font-body text-text-dark dark:text-text-light bg-lilac-sub dark:bg-dawn-dark`}>
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <Header 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          historyCount={recommendationHistory.length}
          onHistoryClick={() => setIsHistoryVisible(true)}
        />
        
        <main className="grid lg:grid-cols-2 gap-8 mt-8">
          <InputForm
            userInput={userInput}
            setUserInput={setUserInput}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            handleSubmit={handleSubmit}
            handleRegenerate={handleRegenerate}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            activeStep={activeStep}
            searchNationwide={searchNationwide}
            setSearchNationwide={setSearchNationwide}
            showRegenerate={showRegenerate}
            handleLocationClick={handleLocationClick}
            isLocating={isLocating}
            userLocation={userLocation}
          />
          
          <Recommendations
            recommendations={recommendations}
            isDarkMode={isDarkMode}
            selectedRegion={searchNationwide ? '전국' : selectedRegion}
            error={error}
            isLocationBased={!!userLocation}
          />
        </main>
        
        <footer className={`mt-8 text-center p-4 rounded-xl ${
          isDarkMode ? 'bg-blue-sub/20' : 'bg-white/50'
        }`}>
          <p className="text-sm font-semibold">
            Powered by Google Gemini API
          </p>
          <p className="text-xs mt-1 opacity-70">
            A quiet library for your soul
          </p>
        </footer>
      </div>
      <HistoryModal 
        isOpen={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        history={recommendationHistory}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;