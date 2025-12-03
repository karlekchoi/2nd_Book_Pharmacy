import { GoogleGenAI, Type } from "@google/genai";
import type { BookRecommendation, UserInput } from '../types';
import { getMultipleBookCovers } from './aladinService'; // 🆕 추가!

const getBookRecommendations = async (
  userInput: UserInput, 
  region: string, 
  excludeTitles: string[] = [],
  location: { latitude: number, longitude: number } | null = null
): Promise<BookRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The book title in Korean." },
        author: { type: Type.STRING, description: "The author's name in Korean." },
        publisher: { type: Type.STRING, description: "The publisher's name in Korean." },
        isbn: { type: Type.STRING, description: "The book's 13-digit ISBN, without hyphens." },
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
      required: ['title', 'author', 'publisher', 'isbn', 'description', 'aiReason', 'vibe', 'libraries']
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

Based on this, recommend exactly 3 books. For each book, provide the requested information including its 13-digit ISBN. Ensure the library information is plausible for major public libraries near the user's specified location.`;

  if (excludeTitles.length > 0) {
    prompt += `\n\nImportant: Please provide a completely new set of recommendations. Do NOT include any of the following titles: ${excludeTitles.join(', ')}.`;
  }

  prompt += `\n\nYour entire output must be a single JSON array, adhering strictly to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

  try {
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

    // 🆕 모든 책의 ISBN 모아서 알라딘에 요청
    const isbns = booksFromAI.map((book: any) => book.isbn);
    const coverImages = await getMultipleBookCovers(isbns);

    // Programmatically add correct purchase links + 표지 이미지
    const results: BookRecommendation[] = booksFromAI.map((book: Omit<BookRecommendation, 'purchaseLinks'>) => {
      const encodedTitle = encodeURIComponent(book.title);
      return {
        ...book,
        coverImage: coverImages[book.isbn] || undefined, // 🆕 이미지 추가! (없으면 undefined)
        purchaseLinks: {
          yes24: `https://www.yes24.com/Product/Search?query=${encodedTitle}`,
          kyobo: `https://search.kyobobook.co.kr/search?keyword=${encodedTitle}`,
          aladin: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedTitle}`
        }
      };
    });

    console.log('✅ Final results with covers:', results);

    return results;

  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    throw new Error("AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요.");
  }
};

export default getBookRecommendations;

