import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/PlaceDetail.css';

const PlaceDetail = () => {
  const { contentid } = useParams();
  const [place, setPlace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        // ✅ 백엔드 프록시 호출
        const response = await fetch(
          `http://localhost:5000/api/detail?contentId=${contentid}`
        );
        const data = await response.json();
        const item = data?.response?.body?.items?.item?.[0];
        setPlace(item);
      } catch (err) {
        console.error('상세정보 API 오류:', err);
      }
    };

    if (contentid) fetchPlaceDetail();
  }, [contentid]);

  if (!place) return <p>로딩 중...</p>;

  const imageUrl =
    (place.firstimage || place.firstimage2 || '').replace(/^http:/, 'https:') ||
    'https://via.placeholder.com/800x400?text=No+Image';

  return (
    <div className="place-detail-container">
      {/* 오른쪽 상단 X 버튼을 추가하려면 navigate(-1) 사용 */}
      {/* <button className="close-btn" onClick={() => navigate(-1)}>✖</button> */}

      <img src={imageUrl} alt={place.title} className="place-image" />

      <div className="save-button-wrapper">
        <button className="save-button">
          <span className="material-icons">bookmark_border</span>
          <span className="save-text">저장</span>
        </button>
      </div>

      <div className="place-info">
        <div className="place-name">{place.title}</div>
        <div className="place-address">📍 주소: {place.addr1 || '주소 정보 없음'}</div>
        {place.tel && <div className="place-tel">☎ 전화: {place.tel}</div>}
        {place.homepage && (
          <div className="place-homepage">
            🌐 홈페이지: <span dangerouslySetInnerHTML={{ __html: place.homepage }} />
          </div>
        )}
        <div className="place-description">📝 개요: {place.overview || '설명 없음'}</div>
        <div className="place-id">🆔 콘텐츠 ID: {place.contentid}</div>
      </div>
    </div>
  );
};

export default PlaceDetail;
