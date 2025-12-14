import React, { useEffect, useRef } from 'react';
import './css/ProjectIntro.css';
// import bgImage from '../images/adv-back.jpg';

const Adv = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section className="project-intro">
      <div
        ref={containerRef}
        className="intro-container"
      // 배경 이미지 제거됨
      >
        <div className="intro-overlay" />
        <div className="intro-content">
          <h2 className="intro-title">이럴 때 WE-GO가 함께합니다</h2>
          <h3 className="intro-subtitle">"WE-GO is here for you"</h3>

          <p className="intro-description">
            저희는 한국 전역의 명소, 맛집, 문화공간을 체계적으로 소개하는 장소 추천 플랫폼입니다.<br></br>
            사용자 리뷰와 지역 데이터를 기반으로,
            가장 정확하고 신뢰할 수 있는 여행 정보를 제공합니다.<br></br><br></br>

            여행, 데이트, 힐링 — 어떤 목적이든
            당신에게 꼭 맞는 장소를 찾아드립니다.
          </p>

          {/* <div className="intro-actions">
            <button className="btn-go">Let's go!</button>
            <span className="price-tag">20€</span>
          </div> */}

          <div className="intro-details">
            <div className="detail-box">
              <div className="detail-icon">🌍</div>
              <h4>Our Mission — 우리의 목표</h4>
              <p>한국 곳곳의 숨은 이야기를 발견하고,
                당신의 하루를 특별한 경험으로 바꿉니다.</p>
            </div>

            <div className="detail-box">
              <div className="detail-icon">💬</div>
              <h4>Community — 함께 만드는 여행</h4>
              <p>사용자의 리뷰와 경험이
                또 다른 여행자의 길잡이가 됩니다.</p>
              {/* <button className="btn-assign">Receive first assignment</button> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Adv;