const express = require("express");
require("dotenv").config();

// ✅ Node.js 환경용 fetch 로더
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY_SB;

router.get("/", async (req, res) => {
  const { lat, lng, station } = req.query;

  const prompt = `
너는 여행 추천 도우미야.
사용자에게 ${station}역 (${lat}, ${lng}) 주변에서 하루 동안 즐길 수 있는 코스를 추천해줘.
JSON 배열 형태로만 출력해. 각 요소는 다음 구조를 따라야 해:
[
  { "name": "장소 이름", "desc": "간단한 설명" }
]
아침은 관광/전시, 점심은 맛집, 오후는 카페로 구성해.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ✅ 모델을 딥시크로 교체
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.warn("⚠️ OpenRouter 응답 없음:", data);
      return res.status(500).json({ error: "AI 응답이 비어 있습니다.", raw: data });
    }

    let result = data.choices[0].message.content.trim();
    let parsed;

    try {
      if (result.startsWith("```")) {
        result = result.replace(/```(json)?/g, "").trim();
      }
      if (!result.startsWith("{") && !result.startsWith("[")) {
        result = "[" + result + "]";
      }
      parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        parsed = { recommendations: parsed };
      }
    } catch (err) {
      console.warn("⚠️ JSON 파싱 실패:", result);
      parsed = {
        recommendations: [
          { name: "추천 실패", desc: "AI 응답을 JSON으로 변환하지 못했습니다." },
        ],
        raw: result,
      };
    }

    res.json(parsed);
  } catch (err) {
    console.error("❌ OpenRouter 추천 실패:", err);
    res.status(500).json({ error: "AI 추천 생성 실패" });
  }
});

module.exports = router;