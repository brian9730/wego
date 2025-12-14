// backend/routes/station.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const KAKAO_API_KEY = process.env.KAKAO_API_KEY;

// ✅ 카카오 로컬 API 단독 자동화 버전
router.get("/:name", async (req, res) => {
  const { name } = req.params;
  console.log(`🚉 역 상세정보 요청: ${name}`);

  try {
    // ✅ 1️⃣ 카카오 검색
    const stationRes = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      params: { query: `${name}역`, size: 1 },
    });

    if (!stationRes.data.documents || stationRes.data.documents.length === 0) {
      console.warn(`⚠️ 카카오 검색 결과 없음: ${name}`);
      return res.json({
        station: name,
        address: "검색 결과 없음",
        desc: `${name}역 주변 정보를 찾을 수 없습니다.`,
        places: { 맛집: [], 카페: [], 관광지: [] },
      });
    }

    const station = stationRes.data.documents[0];
    const { x, y } = station;

    // ✅ 2️⃣ 카테고리별 탐색
    const categories = { 맛집: "FD6", 카페: "CE7", 관광지: "AT4" };
    const nearby = {};

    for (const [label, code] of Object.entries(categories)) {
      const result = await axios.get("https://dapi.kakao.com/v2/local/search/category.json", {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        params: { category_group_code: code, x, y, radius: 700, sort: "distance", size: 5 },
      });
      nearby[label] = result.data.documents.map((p) => ({
        name: p.place_name,
        category: label,
        address: p.road_address_name || p.address_name,
        distance: `${p.distance}m`,
        url: p.place_url,
      }));
    }

    res.json({
      station: name,
      address: station.road_address_name || station.address_name,
      desc: `${name}역 주변 맛집·카페·관광지 추천 장소입니다.`,
      image: station.place_url || null,
      places: nearby,
    });
  } catch (err) {
    console.error("❌ station.js 오류:", err.message);
    res.status(500).json({ error: "카카오 API 호출 실패" });
  }
});


module.exports = router;
