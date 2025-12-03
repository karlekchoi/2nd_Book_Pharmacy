// services/aladinService.ts

/**
 * 알라딘 API로 책 표지 이미지 URL을 가져옵니다
 * @param isbn - 13자리 ISBN (하이픈 없음)
 * @returns 책 표지 이미지 URL
 */
export const getBookCover = async (isbn: string): Promise<string | null> => {
    try {
      // 항상 /api/aladin 사용 (Vercel CLI가 처리)
      const response = await fetch(`/api/aladin?isbn=${isbn}`);
      
      if (!response.ok) {
        console.error('알라딘 API 에러:', response.status);
        return null;
      }
      
      const data: { cover: string | null } = await response.json();
      return data.cover;
  
    } catch (error) {
      console.error('알라딘 API 에러:', error);
      return null;
    }
  };
  
  /**
   * 여러 책의 표지를 한번에 가져옵니다
   * @param isbns - ISBN 배열
   * @returns ISBN을 키로 하는 이미지 URL 맵
   */
  export const getMultipleBookCovers = async (
    isbns: string[]
  ): Promise<Record<string, string>> => {
    const results: Record<string, string> = {};
  
    const promises = isbns.map(async (isbn) => {
      const cover = await getBookCover(isbn);
      if (cover) {
        results[isbn] = cover;
      }
    });
  
    await Promise.all(promises);
    return results;
  };