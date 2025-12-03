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
          isbn: { type: Type.STRING, description: "The book's exact 13-digit ISBN-13 number (without hyphens or spaces). This MUST be a real, existing ISBN for the actual book you are recommending. Do not make up or guess ISBNs. Only provide ISBNs for books that actually exist and are available in South Korea." },
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

Based on this, recommend exactly 3 books. For each book, provide the requested information including its exact 13-digit ISBN-13 number.

CRITICAL: The ISBN must be a real, existing ISBN-13 for the actual book you are recommending. Do NOT make up, guess, or generate fake ISBNs. Only recommend books that you know exist and can provide their real ISBN-13 numbers. The ISBN must be exactly 13 digits, without hyphens or spaces (e.g., "9788936434267").

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

    // Validate and clean ISBNs
    const validateISBN = (isbn: string): string | null => {
      if (!isbn || typeof isbn !== 'string') return null;
      // Remove any hyphens, spaces, or non-digit characters
      const cleaned = isbn.replace(/[^0-9]/g, '');
      // Must be exactly 13 digits
      if (cleaned.length === 13 && /^\d{13}$/.test(cleaned)) {
        return cleaned;
      }
      return null;
    };

    // Programmatically add purchase links and validate ISBNs
    const results = booksFromAI
      .map((book: any) => {
        const validatedISBN = validateISBN(book.isbn);
        if (!validatedISBN) {
          console.warn(`Invalid ISBN for book "${book.title}": ${book.isbn}`);
          // Keep the book but with cleaned ISBN (or null if invalid)
          book.isbn = validatedISBN || book.isbn.replace(/[^0-9]/g, '').slice(0, 13) || '';
        } else {
          book.isbn = validatedISBN;
        }
        
        const encodedTitle = encodeURIComponent(book.title);
        return {
          ...book,
          purchaseLinks: {
            yes24: `https://www.yes24.com/Product/Search?query=${encodedTitle}`,
            kyobo: `https://search.kyobobook.co.kr/search?keyword=${encodedTitle}`,
            aladin: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedTitle}`
          }
        };
      })
      .filter((book: any) => book.isbn && book.isbn.length === 13); // Filter out books with invalid ISBNs

    res.status(200).json(results);

  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    res.status(500).json({ error: "AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요." });
  }
}

