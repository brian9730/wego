const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
// const fetch = require('node-fetch'); 원래꺼
// const response = await fetch(url);


const app = express();
const path = require('path');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', require('./routes/admin'));

// DB 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'wego_db',
  port: 3306,
});

db.connect(err => {
  if (err) console.error('DB 연결 실패:', err);
  else console.log('✅ MariaDB 연결 성공');
});

module.exports = db;

// 기본 라우터
app.get('/', (req, res) => {
  res.send('서버 정상 작동 중');
});

// 회원가입
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  const [user] = await db.promise().query('SELECT id FROM user WHERE email = ?', [email]);
  if (user.length > 0) {
    return res.status(409).json({ message: '이미 가입된 이메일입니다.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // user 테이블 삽입
    const [result] = await db.promise().query(
      'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // page 테이블 기본 정보 삽입
    await db.promise().query(
      'INSERT INTO page (user_id, nickname, fixed_nick) VALUES (?, ?, ?)',
      [userId, name, name]
    );

    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 로그인
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [user] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);

  if (user.length === 0) {
    return res.status(401).json({ message: '이메일이 존재하지 않습니다.' });
  }

  const validPassword = await bcrypt.compare(password, user[0].password);
  if (!validPassword) {
    return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
  }

  res.status(200).json({
    message: '로그인 성공',
    user: {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      is_admin: user[0].is_admin
    }
  });
});

// 회원정보 수정
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  let fields = [];
  let values = [];

  if (name) {
    fields.push('name = ?');
    values.push(name);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push('password = ?');
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: '수정할 데이터가 없습니다.' });
  }

  values.push(id);

  try {
    // ⚡ 템플릿 리터럴 오류 수정
    await db.promise().query(`UPDATE user SET ${fields.join(', ')} WHERE id = ?`, values);

    // nickname도 같이 업데이트
    if (name) {
      await db.promise().query('UPDATE page SET nickname = ? WHERE user_id = ?', [name, id]);
    }

    res.status(200).json({ message: '회원정보 수정 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 회원 탈퇴
app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM user WHERE id = ?', [id]);
    res.status(200).json({ message: '회원 탈퇴 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// ✅ OpenRouter AI API 연동
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  console.log(
    "🧪 OPENROUTER_API_KEY 확인:",
    OPENROUTER_API_KEY ? "로드됨" : "없음"
  );

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: `
너는 여행 플래너 AI야.  
사용자가 한국어로 질문하면 한국어로만 답변하고, 영어로 질문하면 영어로만 답변해.  
답변은 친절하고 간결하게, 불필요하게 장황하지 않게 해.  

여행지를 추천할 때는 반드시 다음 형식을 지켜:  
1. 장소 이름 + 간단한 특징 소개  
2. 사용자가 바로 확인할 수 있도록 링크 제공  
   - 한국 장소: 네이버 링크  
   - 해외 장소: 구글 링크  
3. 여러 곳을 제안할 때는 번호를 붙여 나열  
`,
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("AI 응답:", data);

    const result = data.choices?.[0]?.message?.content || "AI 응답 없음";
    res.json({ answer: result });
  } catch (err) {
    console.error("❌ OpenRouter 오류:", err);
    res.status(500).json({ answer: "서버 오류" });
  }
});


//---------------------------------------------------------------------------
// const express = require('express');
// const fetch = require('node-fetch'); // Node 18 미만에서는 필요
// const app = express();

const KMA_API_KEY = "KXWwko5%2FUXOIyDX88ddpKWY7%2B8UDIopraGlBkm738JD%2Fs%2BggElLNDojqAVckELa8CGY8eTEEc5OMzsuzJ344Zw%3D%3D";
const KAKAO_API_KEY = '58da9cfe12ce3f69b8b65fa89639594a';

// index.js 최상단에 함수 정의
function getBaseDateTime() {
  const now = new Date();
  const baseTimes = [23, 20, 17, 14, 11, 8, 5, 2];
  let hour = now.getHours();

  let baseHour = baseTimes.find(t => hour >= t) || 23;

  if (hour < 2) {
    baseHour = 23;
    now.setDate(now.getDate() - 1);
  }

  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, "");
  const baseTime = String(baseHour).padStart(2, "0") + "00";

  return { baseDate, baseTime };
}

// ----------------- 좌표 변환 함수 -----------------
function convertToKmaCoords(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  const ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  const ro2 = (re * sf) / Math.pow(ro, sn);

  const ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  const ra2 = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra2 * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro2 - ra2 * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
}

// ----- base_date / base_time 계산 (KMA 규칙에 맞춤) -----
function getKmaBaseDateTime(now = new Date()) {
  const baseTimes = [2300, 2000, 1700, 1400, 1100, 800, 500, 200];
  const date = new Date(now);
  let hhmm = date.getHours() * 100 + date.getMinutes();

  // 발표 40분 전이면 아직 데이터 없음 → 직전 발표 시각 사용
  if (date.getMinutes() < 40) {
    hhmm -= 100;
    if (hhmm < 0) {
      date.setDate(date.getDate() - 1);
      hhmm = 2300;
    }
  }

  let base_time = baseTimes.find(bt => hhmm >= bt);
  if (!base_time) {
    date.setDate(date.getDate() - 1);
    base_time = 2300;
  }

  const base_time_str = String(base_time).padStart(4, '0');
  const base_date_str = date.toISOString().slice(0, 10).replace(/-/g, '');
  return { base_date: base_date_str, base_time: base_time_str };
}


// ----- 기상청 날씨 요청 함수 (실패하면 3시간 전으로 fallback) -----
async function fetchWeatherFromKma(coords) {
  let now = new Date();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { base_date, base_time } = getKmaBaseDateTime();
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KMA_API_KEY}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${coords.nx}&ny=${coords.ny}`;

    console.log("👉 요청 URL:", url);

    const response = await fetch(url);
    const text = await response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("JSON 파싱 실패:", e);
      return res.status(500).json({ error: "JSON 파싱 실패", raw: text });
    }

    const items = json?.response?.body?.items?.item;

    if (!items || items.length === 0) {
      console.error("⚠️ 기상청 응답 원본:", JSON.stringify(json, null, 2));
      return res.status(500).json({ error: "데이터가 없습니다." });
    }

    // ❗ 데이터가 없으면 로그 찍고 3시간 전으로 이동
    console.warn("⚠️ 데이터 없음, base_time:", base_time, " → 3시간 전으로 이동");
    now.setHours(now.getHours() - 3);
  }

  throw new Error("기상청 API에서 3회 시도했지만 데이터가 없습니다.");
}


// ----- /api/weather -----
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    // 좌표 결정
    let coords;
    if (city) {
      const cityCoords = {
        서울: { nx: 60, ny: 127 },
        수지구: { nx: 62, ny: 121 },
        부산: { nx: 98, ny: 76 },
      };
      coords = cityCoords[city] || cityCoords['서울'];
    } else if (lat && lon) {
      coords = convertToKmaCoords(Number(lat), Number(lon));
    } else {
      coords = { nx: 60, ny: 127 };
    }

    const { baseDate, baseTime } = getBaseDateTime();

    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KMA_API_KEY}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${coords.nx}&ny=${coords.ny}`;

    console.log("최종 좌표:", coords);
    console.log("요청 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.response?.body?.items?.item) {
      console.error("⚠️ 데이터 없음:", JSON.stringify(data, null, 2));
      return res.status(500).json({ error: "데이터가 없습니다.", raw: data });
    }

    const items = data.response.body.items.item;

    const hourlyMap = {};
    items.forEach(item => {
      const hour = item.fcstTime.slice(0, 2);
      if (!hourlyMap[hour]) hourlyMap[hour] = {};
      hourlyMap[hour][item.category] = item.fcstValue;

      // ✅ 디버깅 로그 추가
      if (item.category === "PTY" || item.category === "SKY") {
        console.log(`시간: ${hour}시, ${item.category}: ${item.fcstValue}`);
      }
    });

    const hourlyArray = Object.keys(hourlyMap)
      .sort((a, b) => a - b)
      .map(hour => ({
        hour: hour + '시',
        temp: hourlyMap[hour].TMP,
        humidity: hourlyMap[hour].REH,
        wind: hourlyMap[hour].WSD,
        pty: hourlyMap[hour].PTY, // ✅ 강수형태
        sky: hourlyMap[hour].SKY, // ✅ 하늘상태
      }));


    res.json(hourlyArray); // ✅ 응답 반환
    console.log("최종 날씨 응답:", hourlyArray);

  } catch (err) {
    console.error('날씨 API 호출 실패:', err);
    res.status(500).json({ error: '날씨 데이터를 불러오지 못했습니다.' });
  }
});


// ----- Kakao 역지오코딩 -----
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat, lon 필요' });

    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(
      lon
    )}&y=${encodeURIComponent(lat)}`;
    const resp = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("❌ 역지오코딩 실패:", err);
    res.status(500).json({ error: "역지오코딩 실패" });
  }
});

// ----- Kakao 장소 검색 -----
app.get('/api/search-place', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'query 필요' });
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=15`;
    const resp = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("❌ 검색 실패:", err);
    res.status(500).json({ error: "검색 실패" });
  }
});

app.listen(5000, () => console.log("✅ Server listening on 5000"));



// ----------------- 라우터 -----------------
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/posts', require('./routes/posts'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/pages', require('./routes/page.js'));
// app.use('/api/likes', require('./routes/likes'));



// ✅ 기타 라우터
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// ✅ 게시글 라우터
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

// ✅ 회원관리리 라우터
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// ✅ routes 폴더의 page.js 연결
const pagesRouter = require('./routes/page.js');
app.use('/api/pages', pagesRouter);

const likeRoutes = require("./routes/likes");
app.use("/api/likes", likeRoutes);

// 댓글 라우터 연결
const commentsRouter = require('./routes/comments');
app.use('/api/comments', commentsRouter);

// 지하철
const stationRouter = require('./routes/station');
app.use('/api/station', stationRouter);

const recommendRouter = require("./routes/recommend");
app.use("/api/recommend", recommendRouter);

// ✅ 관광공사 API 프록시 라우트
app.get("/api/festival", async (req, res) => {
  try {
    const { startDate } = req.query;
    const TOUR_API_KEY = process.env.TOUR_API_KEY; // backend/.env 에 저장 (일반키)

    // ✅ KorService2 + searchFestival2 로 호출
    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${encodeURIComponent(
      TOUR_API_KEY
    )}&MobileOS=ETC&MobileApp=wegoApp&eventStartDate=${startDate}&_type=json&numOfRows=100`;

    //console.log("👉 관광공사 API 요청 URL:", url);

    const response = await fetch(url);
    const text = await response.text();

    if (text.startsWith("<")) {
      //console.error("❌ XML 응답:", text.slice(0, 200));
      return res.status(500).json({ error: "XML 응답 수신", raw: text });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    //console.error("❌ 관광공사 API 호출 실패:", error);
    res.status(500).json({ error: "관광공사 API 호출 실패" });
  }
});


// ✅ 관광공사 상세 조회 프록시 (최종본)
app.get("/api/detail", async (req, res) => {
  try {
    const { contentId } = req.query;
    const TOUR_API_KEY = process.env.TOUR_API_KEY; // backend/.env 에 일반키 저장


    const url = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${encodeURIComponent(
      TOUR_API_KEY
    )}&MobileOS=ETC&MobileApp=wegoApp&contentId=${contentId}&_type=json`;

    console.log("👉 상세조회 API 요청 URL:", url);

    const response = await fetch(url);
    const text = await response.text();

    if (text.startsWith("<")) {
      console.error("❌ XML 응답:", text.slice(0, 200));
      return res.status(500).json({ error: "XML 응답 수신", raw: text });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("❌ 관광공사 상세조회 API 호출 실패:", error);
    res.status(500).json({ error: "상세조회 API 호출 실패" });
  }
});

// ✅ 관광공사 지역기반 조회 프록시
app.get("/api/areaBased", async (req, res) => {
  try {
    const { areaCode, contentTypeId } = req.query;
    const TOUR_API_KEY = process.env.TOUR_API_KEY;

    let url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${encodeURIComponent(
      TOUR_API_KEY
    )}&MobileOS=ETC&MobileApp=wegoApp&numOfRows=9999&pageNo=1&arrange=A&areaCode=${areaCode}&_type=json`;

    if (contentTypeId) url += `&contentTypeId=${contentTypeId}`;

    //console.log("👉 지역기반 API 요청 URL:", url);

    const response = await fetch(url);
    const text = await response.text();

    if (text.startsWith("<")) {
      //console.error("❌ XML 응답:", text.slice(0, 200));
      return res.status(500).json({ error: "XML 응답 수신", raw: text });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    //console.error("❌ 관광공사 지역기반 API 호출 실패:", error);
    res.status(500).json({ error: "지역기반 API 호출 실패" });
  }
});

// ✅ 관광공사 키워드 검색 프록시
app.get("/api/searchKeyword", async (req, res) => {
  try {
    const { keyword } = req.query;
    const TOUR_API_KEY = process.env.TOUR_API_KEY;

    const url = `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${encodeURIComponent(
      TOUR_API_KEY
    )}&MobileOS=ETC&MobileApp=wegoApp&keyword=${encodeURIComponent(
      keyword
    )}&_type=json&numOfRows=100`;

    console.log("👉 키워드 검색 API 요청 URL:", url);

    const response = await fetch(url);
    const text = await response.text();

    if (text.startsWith("<")) {
      console.error("❌ XML 응답:", text.slice(0, 200));
      return res.status(500).json({ error: "XML 응답 수신", raw: text });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("❌ 관광공사 키워드 검색 API 호출 실패:", error);
    res.status(500).json({ error: "키워드 검색 API 호출 실패" });
  }
});

// ✅ Unsplash 대표이미지 API
app.get("/api/station-image", async (req, res) => {
  const { q } = req.query;
  const key = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        q + " subway station"
      )}&per_page=1&orientation=landscape&client_id=${key}`
    );

    const data = await response.json();
    const imageUrl =
      data.results?.[0]?.urls?.regular ||
      "https://images.unsplash.com/photo-1543269865-cbf427effbad";

    res.json({ image: imageUrl });
  } catch (error) {
    console.error("❌ Unsplash API 실패:", error);
    res.status(500).json({ error: "이미지 로드 실패" });
  }
});

// ----------------- 서버 시작 -----------------
app.listen(5000, () => {
  console.log('🚀 서버 실행: http://localhost:5000')
});
