// services/geminiService.ts
// Client-side wrapper for the recommendations API
import type { BookRecommendation, UserInput } from '../types';

const getBookRecommendations = async (
  userInput: UserInput, 
  region: string, 
  excludeTitles: string[] = [],
  location: { latitude: number, longitude: number } | null = null
): Promise<BookRecommendation[]> => {
  try {
    // Call the Vercel serverless function
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        region,
        excludeTitles,
        location,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요.');
    }

    const booksFromAI: BookRecommendation[] = await response.json();

    // 서버에서 이미 표지 이미지를 가져왔으므로, 클라이언트에서는 추가 처리만 수행
    const results: BookRecommendation[] = booksFromAI.map((book) => {
      // ISBN 정리 (하이픈 제거)
      const cleanedISBN = book.isbn ? book.isbn.replace(/[^0-9]/g, '') : '';
      
      return {
        ...book,
        isbn: cleanedISBN || book.isbn, // 정리된 ISBN 사용
        // coverImage는 서버에서 이미 설정됨
      };
    });

    // 디버깅: 각 책의 표지 이미지 상태 확인
    results.forEach(book => {
      console.log(`📖 Book: ${book.title} | ISBN: ${book.isbn} | Cover Image: ${book.coverImage || 'undefined'}`);
    });

    console.log('✅ Final results with covers:', results);

    return results;

  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요.");
  }
};

export default getBookRecommendations;

