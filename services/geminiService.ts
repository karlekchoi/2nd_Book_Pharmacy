// services/geminiService.ts
// Client-side wrapper for the recommendations API
import type { BookRecommendation, UserInput } from '../types';
import { getMultipleBookCovers } from './aladinService';

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

    // 🆕 유효한 ISBN만 모아서 알라딘에 요청
    const validBooks = booksFromAI.filter(book => {
      if (!book.isbn) return false;
      const cleaned = book.isbn.replace(/[^0-9]/g, '');
      return cleaned.length === 13 && /^\d{13}$/.test(cleaned);
    });
    
    const isbns = validBooks.map((book) => book.isbn).filter(Boolean) as string[];
    const coverImages = await getMultipleBookCovers(isbns);

    // Add cover images to results
    const results: BookRecommendation[] = booksFromAI.map((book) => {
      // ISBN 정리
      const cleanedISBN = book.isbn ? book.isbn.replace(/[^0-9]/g, '') : '';
      const coverImage = cleanedISBN ? (coverImages[book.isbn] || coverImages[cleanedISBN]) : undefined;
      
      return {
        ...book,
        isbn: cleanedISBN || book.isbn, // 정리된 ISBN 사용
        coverImage: coverImage || undefined,
      };
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

