import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import defaultImg from "../images/default.jpg";
import "../css/StationDetail.css";

const TABS = ["맛집", "카페", "관광지"];

const StationDetail = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [data, setData] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("맛집");
  const [imageUrl, setImageUrl] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const navigate = useNavigate();

  // ✅ 역 목록 로드
  useEffect(() => {
    fetch("/stations_v2.json")
      .then((res) => res.json())
      .then((data) => setStations(data))
      .catch((err) => console.error("❌ stations_v2.json 로드 실패:", err));
  }, []);

  // ✅ 현재 역 / 이전 / 다음 찾기
  const currentStation = stations.find((s) => s.name === decodedName);
  const currentIndex = stations.findIndex((s) => s.name === decodedName);
  const prevStation = currentIndex > 0 ? stations[currentIndex - 1] : null;
  const nextStation =
    currentIndex < stations.length - 1 ? stations[currentIndex + 1] : null;

  // ✅ 역 주변 데이터
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `/api/station/${encodeURIComponent(decodedName)}`
        );
        setData(res.data);
      } catch (err) {
        console.error("❌ 역 정보 로드 실패:", err);
        setError("역 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [decodedName]);

  // ✅ 자동 이미지 로드
  useEffect(() => {
    fetch(`/api/station-image?q=${encodeURIComponent(decodedName + "역")}`)
      .then((res) => res.json())
      .then((data) => setImageUrl(data.image))
      .catch((err) => console.error("❌ 이미지 로드 실패:", err));
  }, [decodedName]);

  // ✅ 서울시 API로 좌표 가져오기
  useEffect(() => {
    const fetchStationLocation = async () => {
      try {
        const res = await fetch(
          "http://openapi.seoul.go.kr:8088/585456514d6b6b6534386d6f6d4741/json/subwayStationMaster/1/1000/"
        );
        const json = await res.json();
        const rows = json?.subwayStationMaster?.row;

        if (rows && rows.length > 0) {
          const normalize = (str) =>
            str
              ?.replace(/\(.*?\)/g, "")
              ?.replace(/역/g, "")
              ?.replace(/\s+/g, "")
              ?.trim();

          const found = rows.find(
            (s) =>
              s.BLDN_NM &&
              normalize(s.BLDN_NM).includes(normalize(decodedName))
          );

          if (found) {
            const lat = parseFloat(found.LAT);
            const lng = parseFloat(found.LOT);
            setMapCenter({ lat, lng });
            console.log(`✅ ${decodedName} 위치 불러오기 성공`, lat, lng);
          } else {
            console.warn(`⚠️ ${decodedName} 좌표를 찾을 수 없습니다.`);
          }
        }
      } catch (err) {
        console.error("❌ 서울시 API 좌표 불러오기 실패:", err);
      }
    };
    fetchStationLocation();
  }, [decodedName]);

  // ✅ AI 추천 코스 자동 로드
  useEffect(() => {
    if (!mapCenter) return;

    const fetchRecommendations = async () => {
      setLoadingRecommend(true);
      try {
        const res = await fetch(
          `/api/recommend?lat=${mapCenter.lat}&lng=${mapCenter.lng}&station=${decodedName}`
        );
        const data = await res.json();
        setRecommended(data.recommendations || []);
      } catch (err) {
        console.error("❌ 추천 코스 로드 실패:", err);
      } finally {
        setLoadingRecommend(false);
      }
    };

    fetchRecommendations();
  }, [mapCenter, decodedName]);

  // ✅ 공유 기능
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${decodedName}역 주변 여행 정보`,
      text: "WEGO에서 추천하는 AI 기반 여행 코스를 확인해보세요!",
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("📎 링크가 복사되었습니다!");
    }
  };

  // ✅ 로딩 핸들링
  if (loading) return <div className="station-loading">🚇 로딩 중...</div>;
  if (error) return <div className="station-error">{error}</div>;
  if (!data) return <div className="station-empty">데이터 없음</div>;

  const activePlaces = data.places?.[activeTab] || [];
  const finalImg = imageUrl || defaultImg;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={decodedName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="station-page"
      >
        <div className="station-container">
          {/* ✅ 이미지 */}
          <div className="station-image-wrapper">
            <img src={finalImg} alt={`${decodedName}역`} className="station-image" />
            <div className="action-buttons-overlay">
              <button className="share-button" onClick={handleShare}>
                공유
              </button>
            </div>
          </div>

          {/* ✅ 헤더 */}
          <header className="station-header">
            <h1>{decodedName}역</h1>
            <p className="address">{data.address}</p>
            <p className="desc">{data.desc}</p>
          </header>

          {/* ✅ 지도 (서울시 API 기반) */}
          <div className="station-map">
            {mapCenter ? (
              <>
                <Map
                  center={mapCenter}
                  style={{
                    width: "100%",
                    height: "320px",
                    borderRadius: "8px",
                  }}
                  level={4}
                >
                  <MapMarker position={mapCenter} title={`${decodedName}역`} />
                </Map>
                
                {/* ✅ 지도에서 보기 버튼 */}
                <button
                  className="view-map-btn"
                  onClick={() => {
                    const kakaoUrl = `https://map.kakao.com/link/map/${decodedName}역,${mapCenter.lat},${mapCenter.lng}`;
                    window.open(kakaoUrl, "_blank");
                  }}
                >
                  🗺 지도에서 보기
                </button>
              </>
            ) : (
              <p className="no-data">지도 데이터를 불러오는 중입니다...</p>
            )}
          </div>

          {/* ✅ 탭 */}
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ✅ 장소 목록 */}
          <section className="places-section">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {activePlaces.length === 0 ? (
                  <p className="no-data">해당 카테고리의 장소가 없습니다.</p>
                ) : (
                  <div className="places-grid">
                    {activePlaces.map((p, i) => (
                      <div key={i} className="place-card">
                        <a href={p.url} target="_blank" rel="noreferrer" className="place-name">
                          {p.name}
                        </a>
                        <p className="place-address">{p.address}</p>
                        <p className="place-distance">📍 {p.distance}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* ✅ AI 추천 코스 섹션 */}
          <section className="recommend-section">
            <h3 className="recommend-title">AI 추천 코스</h3>
                        
            {loadingRecommend ? (
              <p className="no-data">AI 추천 코스를 불러오는 중...</p>
            ) : recommended.length > 0 ? (
              <motion.div
                className="recommend-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {recommended.map((r, i) => (
                  <motion.div
                    key={i}
                    className="recommend-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                  >
                    <div className="recommend-icon">🎯</div>
                    <div className="recommend-content">
                      <h4>{r.name}</h4>
                      <p>{r.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="no-data">AI 추천 데이터를 불러올 수 없습니다.</p>
            )}
          </section>
          

          {/* ✅ 이전 / 다음 */}
          <div className="station-nav">
            {prevStation && (
              <button
                className="nav-btn prev"
                onClick={() => navigate(`/station/${encodeURIComponent(prevStation.name)}`)}
              >
                ⏮ {prevStation.name}역
              </button>
            )}
            {nextStation && (
              <button
                className="nav-btn next"
                onClick={() => navigate(`/station/${encodeURIComponent(nextStation.name)}`)}
              >
                {nextStation.name}역 ⏭
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StationDetail;
