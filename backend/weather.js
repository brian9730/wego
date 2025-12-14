const express = require('express');
const fetch = require('node-fetch'); // Node.js 18 이상이면 내장 fetch 가능

const app = express();
app.use(express.json());
const PORT = 5001;

// 🌤️ 지역 좌표 (KMA API용)
const cityCoords = {
  서울: { nx: 60, ny: 127 },
  수지구: { nx: 62, ny: 121 },
  부산: { nx: 98, ny: 76 },
};

// ⚡ API 키 직접 입력
const KMA_API_KEY = 'KXWwko5/UXOIyDX88ddpKWY7+8UDIopraGlBkm738JD/s+ggElLNDojqAVckELa8CGY8eTEEc5OMzsuzJ344Zw==';

// 기본 테스트 라우터
app.get('/', (req, res) => {
  res.send('✅ 날씨 서버 정상 작동 중');
});

// 날씨 조회 라우터
// ?city=서울 형식으로 쿼리 전송
app.get('/weather', async (req, res) => {
  const city = req.query.city || '서울';
  const coords = cityCoords[city] || cityCoords['서울'];

  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  if (minutes < 40) hours -= 1;
  if (hours < 0) hours = 23;

  const base_time = (hours < 10 ? '0' : '') + hours + '00';
  const base_date = now.toISOString().slice(0, 10).replace(/-/g, '');

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${encodeURIComponent(KMA_API_KEY)}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${coords.nx}&ny=${coords.ny}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const items = data?.response?.body?.items?.item;
    if (!items || !Array.isArray(items)) throw new Error('데이터가 없습니다.');

    // 시간별 데이터 가공
    const hourlyMap = {};
    items.forEach(item => {
      const time = item.fcstTime.slice(0, 2); // 시간만 추출
      if (!hourlyMap[time]) hourlyMap[time] = {};
      hourlyMap[time][item.category] = item.fcstValue;
    });

    const hourlyArray = Object.keys(hourlyMap)
      .sort((a, b) => a - b)
      .map(time => ({
        hour: time + '시',
        temp: hourlyMap[time].TMP,
        humidity: hourlyMap[time].REH,
        wind: hourlyMap[time].WSD,
      }));

    res.json(hourlyArray); // 프론트엔드에 바로 전달
  } catch (err) {
    console.error('날씨 API 호출 실패:', err);
    res.status(500).json({ error: '날씨 데이터를 불러오지 못했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🌤️ 날씨 서버 실행: http://localhost:${PORT}`);
});
