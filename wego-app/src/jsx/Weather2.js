// D:\wego\wego-app\src\jsx\Weather2.js
import React, { useEffect, useState } from "react";
import "../css/Weather2.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 날씨 이모지
const getWeatherIcon = (pty, sky) => {
  pty = String(pty);
  sky = String(sky);

  if (pty === "1") return "🌧️";
  if (pty === "2") return "🌨️";
  if (pty === "3") return "❄️";
  if (pty === "4") return "🌦️";

  if (sky === "1") return "☀️";
  if (sky === "3") return "🌤️";
  if (sky === "4") return "☁️";

  return "☀️";
};

function Weather2({ lat: initialLat, lon: initialLon }) {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({
    lat: initialLat || 37.5665,
    lon: initialLon || 126.978,
  });
  const [hourly, setHourly] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [sunTimes, setSunTimes] = useState({ sunrise: "", sunset: "" });
  const [airQuality, setAirQuality] = useState({
    pm10: null,
    pm25: null,
    level: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 시간별 카루셀 인덱스
  const [hourIndex, setHourIndex] = useState(0);
  const visibleCount = 6;

  // 검색 인풋 변경 → 자동완성
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/search-place?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data.documents || []);
    } catch (err) {
      console.error("자동완성 실패:", err);
    }
  };

  // 자동완성 클릭
  const handleSuggestionClick = (place) => {
    setCoords({ lat: parseFloat(place.y), lon: parseFloat(place.x) });
    setQuery(place.place_name);
    setSuggestions([]);
  };

  // 현재 위치 버튼
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });

        try {
          const res = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const region = data.documents?.[0]?.address?.region_2depth_name;
          setQuery(region || "현재 위치");
        } catch (err) {
          console.error("역지오코딩 실패:", err);
        }
      },
      (err) => {
        console.error("위치 정보 실패:", err);
        setError("위치 정보를 가져올 수 없습니다.");
      }
    );
  };

  // 일출·일몰 임시 계산
  const calcSunTimes = () => {
    const now = new Date();
    const sunrise = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      7,
      10
    );
    const sunset = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      17,
      30
    );

    const fmt = (d) =>
      d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

    setSunTimes({ sunrise: fmt(sunrise), sunset: fmt(sunset) });
  };

  // 공기질 임시 계산
  const calcAirQuality = () => {
    const base = Math.abs(Math.round(coords.lat * 3 + coords.lon)) % 50;
    const pm10 = 30 + base;
    const pm25 = 15 + Math.round(base * 0.6);

    let level = "좋음";
    if (pm10 > 80 || pm25 > 35) level = "나쁨";
    else if (pm10 > 50 || pm25 > 25) level = "보통";

    setAirQuality({ pm10, pm25, level });
  };

  // 좌표 바뀔 때 날씨 호출
  useEffect(() => {
    if (!coords.lat || !coords.lon) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "날씨 정보를 불러오지 못했습니다.");
        }

        setHourly(data || []);
        setHourIndex(0); // 새 데이터 들어오면 카루셀 리셋
        calcSunTimes();
        calcAirQuality();
      } catch (err) {
        console.error("날씨 호출 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coords.lat, coords.lon]);

  const current = hourly[0] || null;

  // 그래프용 데이터
  const chartData = hourly.map((h) => ({
    time: h.hour,
    temp: Number(h.temp),
  }));

  // 시간별 카루셀 데이터
  const hasCarousel = hourly.length > visibleCount;

  const getVisibleHours = () => {
    if (!hourly || hourly.length === 0) return [];
    const len = hourly.length;
    const count = Math.min(visibleCount, len);
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(hourly[(hourIndex + i) % len]);
    }
    return result;
  };

  const visibleHours = getVisibleHours();

  const handleNextHours = () => {
    if (!hasCarousel) return;
    setHourIndex((prev) => (prev + 1) % hourly.length);
  };

  const handlePrevHours = () => {
    if (!hasCarousel) return;
    setHourIndex((prev) => (prev - 1 + hourly.length) % hourly.length);
  };

  // 공기질 뱃지 색상 클래스
  const airLevelClass =
    airQuality.level === "좋음"
      ? "good"
      : airQuality.level === "보통"
      ? "normal"
      : airQuality.level === "나쁨"
      ? "bad"
      : "unknown";

  return (
    <div className="weather2-page">
      <div className="weather2-container">
        {/* 상단 헤더 */}
        <header className="weather2-header">
          <h1 className="weather2-title">Weather</h1>
          <span className="weather2-subtitle">
            오늘과 시간별 날씨, 공기질 정보를 한눈에
          </span>
        </header>

        {/* 검색 영역 */}
        <div className="weather2-search-row">
          <input
            className="weather2-search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="예: 강남, 홍대, 수지구"
          />
          <button
            className="weather2-location-btn"
            type="button"
            onClick={handleCurrentLocation}
          >
            📍
          </button>
        </div>

        {/* 자동완성 리스트 */}
        {suggestions.length > 0 && (
          <ul className="weather2-suggestion-list">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="weather2-suggestion-item"
                onClick={() => handleSuggestionClick(s)}
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="weather2-status-text">날씨 불러오는 중...</p>}
        {error && (
          <p className="weather2-status-text weather2-error-text">
            오류: {error}
          </p>
        )}

        {!loading && !error && current && (
          <>
            {/* 상단 메인 카드 */}
            <div className="weather2-main-card">
              <div className="weather2-main-left">
                <div className="weather2-main-location">
                  {query || "선택된 지역 없음"}
                </div>
                <div className="weather2-main-temp">
                  {current.temp}
                  <span className="weather2-main-temp-unit">°C</span>
                </div>
                <div className="weather2-main-desc">
                  {getWeatherIcon(current.pty, current.sky)}{" "}
                  <span>
                    습도 {current.humidity}% · 바람 {current.wind} m/s
                  </span>
                </div>
              </div>

              <div className="weather2-main-right">
                <div className="weather2-chart-title">시간별 기온</div>
                <div className="weather2-chart-wrapper">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          color: "#111827",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 1, stroke: "#4338ca" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 가운데 info 카드 */}
            <div className="weather2-info-row">
              <div className="weather2-info-card">
                <span className="weather2-info-label">Wind</span>
                <span className="weather2-info-value">{current.wind} m/s</span>
              </div>
              <div className="weather2-info-card">
                <span className="weather2-info-label">Humidity</span>
                <span className="weather2-info-value">
                  {current.humidity}%
                </span>
              </div>
              <div className="weather2-info-card">
                <span className="weather2-info-label">Sky</span>
                <span className="weather2-info-value">
                  {getWeatherIcon(current.pty, current.sky)}
                </span>
              </div>
            </div>

            {/* 일출/일몰 + 공기질 */}
            <div className="weather2-bottom-grid">
              <div className="weather2-subcard">
                <div className="weather2-subcard-title">일출 & 일몰</div>
                <div className="weather2-sun-row">
                  <div className="weather2-sun-block">
                    <div className="weather2-sun-icon">🌅</div>
                    <div className="weather2-sun-label">Sunrise</div>
                    <div className="weather2-sun-time">
                      {sunTimes.sunrise}
                    </div>
                  </div>
                  <div className="weather2-sun-block">
                    <div className="weather2-sun-icon">🌇</div>
                    <div className="weather2-sun-label">Sunset</div>
                    <div className="weather2-sun-time">{sunTimes.sunset}</div>
                  </div>
                </div>
              </div>

              <div className="weather2-subcard">
                <div className="weather2-subcard-title">공기질</div>
                <div className="weather2-air-row">
                  <div className="weather2-air-item">
                    <span className="weather2-air-label">PM10</span>
                    <span className="weather2-air-value">
                      {airQuality.pm10 ?? "--"} ㎍/m³
                    </span>
                  </div>
                  <div className="weather2-air-item">
                    <span className="weather2-air-label">PM2.5</span>
                    <span className="weather2-air-value">
                      {airQuality.pm25 ?? "--"} ㎍/m³
                    </span>
                  </div>
                  <div className="weather2-air-level">
                    상태:{" "}
                    <span
                      className={`weather2-air-chip weather2-air-${airLevelClass}`}
                    >
                      {airQuality.level || "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 시간별 예보 - 카루셀 */}
            <div className="weather2-hourly-section">
              <div className="weather2-hourly-header">
                <div className="weather2-hourly-title">시간별 예보</div>
                {hasCarousel && (
                  <div className="weather2-hourly-controls">
                    <button
                      type="button"
                      className="weather2-arrow-btn"
                      onClick={handlePrevHours}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="weather2-arrow-btn"
                      onClick={handleNextHours}
                    >
                      ▶
                    </button>
                  </div>
                )}
              </div>
              <div className="weather2-hourly-scroll">
                {visibleHours.map((h, idx) => (
                  <div key={`${h.hour}-${idx}`} className="weather2-hour-card">
                    <div className="weather2-hour-time">{h.hour}</div>
                    <div className="weather2-hour-icon">
                      {getWeatherIcon(h.pty, h.sky)}
                    </div>
                    <div className="weather2-hour-temp">{h.temp}°C</div>
                    <div className="weather2-hour-sub">
                      💧 {h.humidity}% · 💨 {h.wind}m/s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Weather2;
export const Weather = Weather2;