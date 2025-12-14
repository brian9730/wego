// src/jsx/About.js
import React from 'react';
import mainImage from '../images/main.jpg';
import '../css/About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* 상단 마키 영역 */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
          <span>WE - GO&nbsp;</span>
        </div>
      </div>

      {/* 중앙 컨텐츠 영역: 폭 70% */}
      <div className="about-container">
        <h1 className="about-title">About Us</h1>

        <section className="about-info">
          <h2>우리의 이야기</h2>
          <p>
            WE-GO는 여행자들이 꿈꾸는 여행을 실현할 수 있도록 돕는 플랫폼입니다.
            우리가 제공하는 맞춤형 여행 정보와 추천 서비스는 사용자가 쉽게 여행 계획을 세우고,
            직접 경험을 공유하며
            보다 특별한 사용용을 누릴 수 있도록 지원합니다.
          </p>
          <p>
            여행의 모든 순간이 소중하듯, WE-GO는 개인의 취향과 선호도를 반영한 맞춤형 코스를 제안하며,
            최신 트렌드와 안전 정보를 기반으로 신뢰할 수 있는 여행 솔루션을 제공합니다.
          </p>
        </section>

        {/* 이미지 섹션 추가 */}
        <section className="about-image">
          <img src={mainImage} alt="About" />
        </section>

        <section className="about-vision">
          <h2>우리의 비전</h2>
          <p>
            우리의 비전은 여행을 통해 더 넓은 세상과 소통하고, 각자의 삶에 새로운 영감을 불어넣는 것입니다.
            지금 WE-GO와 함께 여러분만의 특별한 여행을 시작해 보세요.
            즐겁고 안전한 여행 문화를 만들기 위해, 저희는 계속해서 발전해 나갈 것입니다.
          </p>
        </section>

        <section className="about-purpose">
          <div className="purpose-grid">
            <div className="purpose-item">
              <h2>NO.1</h2>
              <p>사용자의 관심사에 최적화된 여행지 추천 및 개인 맞춤 코스 제안</p>
            </div>
            <div className="purpose-item">
              <h2>NO.2</h2>
              <p>사용자의 여행 일정·예약·후기·커뮤니티 등 직접 관리 기능 제공</p>
            </div>
            <div className="purpose-item">
              <h2>NO.3</h2>
              <p>최신 트렌드, 안전 정보, 이벤트 소식을 실시간으로 반영</p>
            </div>
            <div className="purpose-item">
              <h2>NO.4</h2>
              <p>지역 특화 콘텐츠 및 협업을 통한 국내외 관광 활성화</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
