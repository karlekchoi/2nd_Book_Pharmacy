// api/aladin.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALADIN_API_KEY = 'ttbnouvellelunec1925001';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 헤더 추가 (브라우저 접근 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { isbn } = req.query;

  if (!isbn || typeof isbn !== 'string') {
    return res.status(400).json({ error: 'ISBN이 필요해요' });
  }

  try {
    const url = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?` +
      `ttbkey=${ALADIN_API_KEY}` +
      `&itemIdType=ISBN13` +
      `&ItemId=${isbn}` +
      `&output=js` +
      `&Version=20131101` +
      `&Cover=Big`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json({
      cover: data.item?.[0]?.cover || null
    });

  } catch (error) {
    console.error('알라딘 API 에러:', error);
    res.status(500).json({ error: '이미지를 가져올 수 없어요' });
  }
}