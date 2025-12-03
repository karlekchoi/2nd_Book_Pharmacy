// services/aladinService.ts

/**
 * 알라딘 API로 책 표지 이미지 URL을 가져옵니다
 * @param isbn - 13자리 ISBN (하이픈 없음)
 * @returns 책 표지 이미지 URL
 */
export const getBookCover = async (isbn: string): Promise<string | null> => {
    try {
      // ISBN이 없거나 유효하지 않으면 API 호출하지 않음
      if (!isbn || typeof isbn !== 'string') {
        return null;
      }
      
      // 하이픈 제거하고 숫자만 추출
      const cleanedISBN = isbn.replace(/[^0-9]/g, '');
      
      // 13자리 ISBN이 아니면 무시
      if (cleanedISBN.length !== 13 || !/^\d{13}$/.test(cleanedISBN)) {
        console.warn(`Invalid ISBN format: ${isbn}`);
        return null;
      }
      
      // 항상 /api/aladin 사용 (Vercel CLI가 처리)
      const response = await fetch(`/api/aladin?isbn=${cleanedISBN}`);
      
      if (!response.ok) {
        console.error('알라딘 API 에러:', response.status, `for ISBN: ${cleanedISBN}`);
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

    // 유효한 ISBN만 필터링
    const validISBNs = isbns.filter(isbn => {
      if (!isbn || typeof isbn !== 'string') return false;
      const cleaned = isbn.replace(/[^0-9]/g, '');
      return cleaned.length === 13 && /^\d{13}$/.test(cleaned);
    });

    const promises = validISBNs.map(async (isbn) => {
      const cover = await getBookCover(isbn);
      if (cover) {
        // 원본 ISBN과 정리된 ISBN 모두 저장
        const cleanedISBN = isbn.replace(/[^0-9]/g, '');
        results[isbn] = cover;
        results[cleanedISBN] = cover; // 정리된 ISBN으로도 접근 가능하도록
      }
    });

    await Promise.all(promises);
    return results;
  };