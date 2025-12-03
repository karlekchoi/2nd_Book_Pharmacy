// api/recommendations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, region, excludeTitles = [], location = null } = req.body;

  if (!userInput || !userInput.mood) {
    return res.status(400).json({ error: 'userInput with mood is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The book title in Korean." },
          author: { type: Type.STRING, description: "The author's name in Korean." },
          publisher: { type: Type.STRING, description: "The publisher's name in Korean." },
          isbn: { type: Type.STRING, description: "OPTIONAL: If you know the exact ISBN-13, provide it. Otherwise, leave empty and the system will search for it." },
          description: { type: Type.STRING, description: "A short, insightful one-sentence description of the book." },
          aiReason: { type: Type.STRING, description: "An empathetic reason for recommending this book, written in a calm and thoughtful tone." },
          vibe: {
            type: Type.ARRAY,
            description: "An array of 3 relevant keywords or themes in Korean.",
            items: { type: Type.STRING }
          },
          libraries: {
            type: Type.ARRAY,
            description: "An array of 3 plausible public libraries located near the user's specified location.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The library's full name." },
                available: { type: Type.BOOLEAN, description: "A boolean indicating if the book is available." },
                distance: { type: Type.STRING, description: "Optional. A plausible distance like '2.3km' if available is true." },
                waitlist: { type: Type.INTEGER, description: "Optional. A plausible number on the waitlist if available is false." },
              },
              required: ['name', 'available']
            }
          },
        },
        required: ['title', 'author', 'publisher', 'description', 'aiReason', 'vibe', 'libraries']
      }
    };

    const genrePreference = userInput.genre
      ? `They have expressed a preference for the ${userInput.genre} genre.`
      : "They have not specified a preferred genre, so recommend from any genre that fits their needs.";

    const locationInfo = location
      ? `Their current location is approximately latitude: ${location.latitude}, longitude: ${location.longitude}. Base the library recommendations on this precise location.`
      : `They are interested in libraries in the ${region} area of South Korea.`;

    let prompt = `You are a sophisticated and thoughtful book curator for "종이약국" (The Paper Pharmacy). Your tone is calm, empathetic, and knowledgeable, like a trusted librarian. Your goal is to prescribe the perfect book for a user's state of mind.

The user's current mood is: ${userInput.mood}
Their situation is: ${userInput.situation || "Not specified."}
${genrePreference}
Their goal for reading is: ${userInput.purpose || "Not specified."}
${locationInfo}

Based on this, recommend exactly 3 books. For each book, provide the title, author, publisher, description, and other requested information.

IMPORTANT: Only recommend real books that actually exist. Provide accurate book titles and author names in Korean. The ISBN field is optional - if you know the exact ISBN-13, you can provide it, but it's better to leave it empty and let the system search for the correct ISBN based on the title and author.

Ensure the library information is plausible for major public libraries near the user's specified location.`;

    if (excludeTitles.length > 0) {
      prompt += `\n\nImportant: Please provide a completely new set of recommendations. Do NOT include any of the following titles: ${excludeTitles.join(', ')}.`;
    }

    prompt += `\n\nYour entire output must be a single JSON array, adhering strictly to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const booksFromAI = JSON.parse(jsonString);

    // 알라딘 검색 API로 실제 ISBN 가져오기
    const ALADIN_API_KEY = 'ttbnouvellelunec1925001';
    const searchBookISBN = async (title: string, author: string): Promise<{ isbn: string | null, publisher?: string }> => {
      try {
        // 제목과 저자로 검색 (저자가 있으면 함께 검색)
        const query = author ? `${title} ${author}` : title;
        const url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?` +
          `ttbkey=${ALADIN_API_KEY}` +
          `&Query=${encodeURIComponent(query)}` +
          `&QueryType=Title` +
          `&MaxResults=5` +
          `&start=1` +
          `&SearchTarget=Book` +
          `&output=js` +
          `&Version=20131101`;

        const searchResponse = await fetch(url);
        const searchData = await searchResponse.json();
        
        if (!searchData.item || searchData.item.length === 0) {
          console.warn(`No results found for "${title}" by ${author}`);
          return { isbn: null };
        }
        
        // 제목과 저자가 일치하는 결과 찾기
        const normalizeString = (str: string) => str.replace(/\s+/g, '').toLowerCase();
        const normalizedTitle = normalizeString(title);
        const normalizedAuthor = author ? normalizeString(author) : null;
        
        // 가장 일치하는 결과 찾기
        let bestMatch = searchData.item[0];
        let bestScore = 0;
        
        for (const item of searchData.item) {
          const itemTitle = normalizeString(item.title || '');
          const itemAuthor = item.author ? normalizeString(item.author) : '';
          
          let score = 0;
          // 제목 일치도 확인
          if (itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle)) {
            score += 10;
          }
          // 저자 일치도 확인
          if (normalizedAuthor && itemAuthor.includes(normalizedAuthor)) {
            score += 5;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        }
        
        const isbn13 = bestMatch.isbn13 || bestMatch.isbn || null;
        
        if (!isbn13) {
          console.warn(`No ISBN found in search results for "${title}"`);
          return { isbn: null };
        }
        
        return {
          isbn: isbn13.replace(/[^0-9]/g, ''),
          publisher: bestMatch.publisher || undefined
        };
      } catch (error) {
        console.error(`Error searching ISBN for "${title}":`, error);
        return { isbn: null };
      }
    };

    // 각 책에 대해 실제 ISBN 검색
    const resultsWithISBNs = await Promise.all(
      booksFromAI.map(async (book: any) => {
        let isbn = book.isbn || '';
        
        // ISBN이 없거나 유효하지 않으면 알라딘에서 검색
        const cleanedExistingISBN = book.isbn ? book.isbn.replace(/[^0-9]/g, '') : '';
        if (!cleanedExistingISBN || cleanedExistingISBN.length !== 13 || !/^\d{13}$/.test(cleanedExistingISBN)) {
          console.log(`[ISBN Search] Searching for: "${book.title}" by ${book.author || 'Unknown'}`);
          const searchResult = await searchBookISBN(book.title, book.author || '');
          if (searchResult.isbn && searchResult.isbn.length === 13) {
            isbn = searchResult.isbn;
            console.log(`[ISBN Search] ✅ Found ISBN ${isbn} for "${book.title}"`);
            // 알라딘에서 가져온 출판사 정보로 업데이트 (없는 경우에만)
            if (searchResult.publisher && !book.publisher) {
              book.publisher = searchResult.publisher;
            }
          } else {
            console.warn(`[ISBN Search] ❌ Could not find valid ISBN for: "${book.title}" by ${book.author || 'Unknown'}`);
            // ISBN을 찾지 못한 경우 빈 문자열로 설정 (타입 호환성)
            isbn = '';
          }
        } else {
          // 기존 ISBN 정리 (하이픈 제거)
          isbn = cleanedExistingISBN;
          console.log(`[ISBN Search] ✓ Using existing ISBN ${isbn} for "${book.title}"`);
        }
        
        const encodedTitle = encodeURIComponent(book.title);
        return {
          ...book,
          isbn: isbn || '', // null을 빈 문자열로 변환 (타입 호환성)
          purchaseLinks: {
            yes24: `https://www.yes24.com/Product/Search?query=${encodedTitle}`,
            kyobo: `https://search.kyobobook.co.kr/search?keyword=${encodedTitle}`,
            aladin: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedTitle}`
          }
        };
      })
    );

    // ISBN이 있는 책만 반환 (또는 모두 반환하고 클라이언트에서 처리)
    const results = resultsWithISBNs;

    res.status(200).json(results);

  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    res.status(500).json({ error: "AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요." });
  }
}

