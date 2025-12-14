import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/EventDetailPage.css';

const EventDetailPage = () => {
  const location = useLocation();
  const { contentid } = location.state || {}; // 전달받은 contentid
  const [eventDetail, setEventDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        console.log("받은 contentid:", contentid); // 디버깅

        const response = await fetch(
          `http://localhost:5000/api/detail?contentId=${contentid}`
        );
        const text = await response.text();
        console.log("백엔드 응답 원문:", text.slice(0, 300)); // XML 오는지 확인

        const data = JSON.parse(text);
        const item = data.response?.body?.items?.item?.[0];
        setEventDetail(item);
      } catch (err) {
        console.error("상세정보 API 오류:", err);
      }
    };

    if (contentid) {
      fetchDetail();
    }
  }, [contentid]);


  if (!eventDetail) return <div>로딩 중...</div>;

  let homepageUrl = eventDetail.homepage;
  if (homepageUrl) {
    const match = homepageUrl.match(/href=["']?(https?:\/\/[^"'>]+)/);
    if (match) {
      homepageUrl = match[1];
    } else if (!homepageUrl.startsWith('http')) {
      homepageUrl = 'http://' + homepageUrl;
    }
  }

  return (
    <div className="event-detail">
      <h2>{eventDetail.title}</h2>
      <p><strong>주소:</strong> {eventDetail.addr1}</p>
      <p><strong>개요:</strong> {eventDetail.overview}</p>
      <p><strong>홈페이지:</strong>{' '}
        {homepageUrl ? (
          <a href={homepageUrl} target="_blank" rel="noopener noreferrer">
            홈페이지 바로가기
          </a>
        ) : (
          '제공된 홈페이지 정보 없음'
        )}
      </p>
    </div>
  );
};

export default EventDetailPage;
