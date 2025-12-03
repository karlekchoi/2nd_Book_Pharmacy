// api/aladin-search.ts
// 알라딘 검색 API로 제목/저자로 책을 검색하고 실제 ISBN을 가져옵니다
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALADIN_API_KEY = 'ttbnouvellelunec1925001';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, author } = req.method === 'POST' ? req.body : req.query;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: '책 제목이 필요해요' });
  }

  try {
    // 제목과 저자로 검색
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

    const response = await fetch(url);
    const data = await response.json();

    if (!data.item || data.item.length === 0) {
      return res.status(404).json({ 
        error: '책을 찾을 수 없어요',
        found: false 
      });
    }

    // 가장 관련성 높은 첫 번째 결과 반환
    const firstResult = data.item[0];
    
    res.status(200).json({
      found: true,
      isbn13: firstResult.isbn13 || firstResult.isbn || null,
      title: firstResult.title || title,
      author: firstResult.author || author || null,
      publisher: firstResult.publisher || null,
      cover: firstResult.cover || null,
      description: firstResult.description || null,
    });

  } catch (error) {
    console.error('알라딘 검색 API 에러:', error);
    res.status(500).json({ 
      error: '책을 검색할 수 없어요',
      found: false 
    });
  }
}

