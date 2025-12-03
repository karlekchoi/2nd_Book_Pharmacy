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

    // 🆕 모든 책의 ISBN 모아서 알라딘에 요청
    const isbns = booksFromAI.map((book) => book.isbn);
    const coverImages = await getMultipleBookCovers(isbns);

    // Add cover images to results
    const results: BookRecommendation[] = booksFromAI.map((book) => ({
      ...book,
      coverImage: coverImages[book.isbn] || undefined,
    }));

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

