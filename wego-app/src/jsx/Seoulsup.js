import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import bannerImage from '../images/perment.jpg';
import cafe1 from '../images/perment2.jpg';
import cafe1_alt1 from '../images/perment_alt2.jpg';
import cafe1_alt2 from '../images/perment_alt1.jpg';

import cafe2 from '../images/camel.jpg';
import cafe2_alt1 from '../images/camel_alt1.jpg';
import cafe2_alt2 from '../images/camel_alt2.jpg';

import cafe3 from '../images/lowide.jpg';
import cafe4 from '../images/lowforest.jpg';
import cafe5 from '../images/la.jpg';

import '../css/Seoulsup.css';

const cafes = [
  {
    name: '퍼먼트 서울숲점',
    desc: '맛있는 빵과 커피가 어우러진 공간',
    imgs: [cafe1, cafe1_alt1, cafe1_alt2],
  },
  {
    name: '카멜커피 성수점',
    desc: '마음이 평온해지는 감성 카페',
    imgs: [cafe2, cafe2_alt1, cafe2_alt2],
  },
  {
    name: 'LOWIDE',
    desc: '맛있는 빵과 다양한 디저트의 향연',
    imgs: [cafe3, cafe2_alt1, cafe2_alt2],
  },
  {
    name: '로우포레스트',
    desc: '진한 아메리카노와 넓은 정원의 조화',
    imgs: [cafe4, cafe2_alt1, cafe2_alt2],
  },
  {
    name: '라프레플루트 성수',
    desc: '신선한 과일로 만든 맛있는 케이크',
    imgs: [cafe5, cafe2_alt1, cafe2_alt2],
  }
];

const CafeRecommendPage = () => {
  const navigate = useNavigate();
  const [bookmarkedCafes, setBookmarkedCafes] = useState(Array(cafes.length).fill(false));

  const toggleBookmark = (e, index) => {
    e.stopPropagation();
    setBookmarkedCafes(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <div className="seoulsup-page">
      <div className="seoulsup-banner">
        <img src={bannerImage} alt="Seoul Forest Banner" />
        <div className="seoulsup-banner-overlay" />
        <h1>서울숲 데이트 장소 - 카페 모음집</h1>
      </div>

      <div className="seoulsup-list">
        {cafes.map((cafe, idx) => (
          <div
            className="seoulsup-card"
            key={idx}
            onClick={() => navigate(`/cafe/${idx}`)}
            style={{ cursor: 'pointer' }}
          >
            <button
              className="bookmark-btn"
              onClick={(e) => toggleBookmark(e, idx)}
            >
              <span
                className={`material-symbols-outlined bookmark-icon ${
                  bookmarkedCafes[idx] ? 'active' : ''
                }`}
              >
                bookmark
              </span>
            </button>

            <div className="seoulsup-info">
              <h3>{cafe.name}</h3>
              <p>{cafe.desc}</p>
            </div>
            <div className="seoulsup-image-grid">
              {cafe.imgs.map((imgSrc, i) => (
                <img key={i} src={imgSrc} alt={`${cafe.name} ${i + 1}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CafeRecommendPage;