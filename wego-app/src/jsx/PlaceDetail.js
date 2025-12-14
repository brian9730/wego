import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/PlaceDetail.css';

const PlaceDetail = () => {
  const { contentid } = useParams();
  const [place, setPlace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        // ✅ 백엔드 프록시 사용 (CORS 완전 해결)
        const response = await axios.get("http://localhost:5000/api/detail", {
          params: { contentId: contentid },
        });

        const item = response?.data?.response?.body?.items?.item?.[0];
        setPlace(item);
      } catch (err) {
        console.error('상세정보 API 오류:', err);
      }
    };

    if (contentid) fetchPlaceDetail();
  }, [contentid]);

  if (!place) return <p>로딩 중...</p>;

  const imageUrl =
    (place.firstimage || place.firstimage2 || '')
      .replace(/^http:/, 'https:')
      || 'https://via.placeholder.com/800x400?text=No+Image';

  return (
    <div className="place-detail-container">

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
            🌐 홈페이지: 
            <span dangerouslySetInnerHTML={{ __html: place.homepage }} />
          </div>
        )}
        <div className="place-description">📝 개요: {place.overview || '설명 없음'}</div>
        <div className="place-id">🆔 콘텐츠 ID: {place.contentid}</div>
      </div>
    </div>
  );
};

export default PlaceDetail;
