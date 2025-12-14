import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import subway from "../images/skill1.jpeg";
import weather from "../images/skill2.jpeg";
import mapsearch from "../images/skill4.png";
import community from "../images/skill3.jpeg";
import planner from "../images/skill5.png"; // 새 콘텐츠용 이미지

export const Skills = ({ openChat }) => {
  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  return (
    <section className="skill" id="skills">
      <div className="container">
        <div className="skills-title" data-aos="fade-down" data-aos-delay="100">
          <h2 className="skills-heading">
            당신의 여행을 <br />더 특별하게 만드는 <br />작은 도구들
          </h2>
          <p className="skills-extra">
            Here’s What You Can Do With Us
          </p>
        </div>

        <div className="grid-container">
          <Link
            to="/subway"
            className="grid-item grid-item--first"
            title="지하철 노선따라 떠나기"
            aria-label="🚇 지하철 노선도 기반: 주변 카페 & 장소 추천"
            data-aos="fade-up"
          >
            <img src={subway} alt="지하철" />
            <div className="grid-content content-subway">
              <p>뚜벅이들을 위한</p>
              <h6>지하철 노선도 기반</h6>
            </div>
          </Link>

          <Link
            to="/weather2"
            className="grid-item grid-item--second"
            title="실시간 날씨 확인"
            aria-label="☀️ 여행 전 필수 체크: 실시간 날씨 확인"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <img src={weather} alt="날씨" />
            <div className="grid-content content-weather">
              <p>오늘 날씨 어때?</p>
              <h6>여행 전 필수 체크</h6>
            </div>
          </Link>

          <Link
            to="/MyPage"
            className="grid-item grid-item--third"
            title="다른 유저와 공유하기"
            aria-label="💬 커뮤니티 포스트: 다른 유저와 공유하기"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <img src={community} alt="커뮤니티" />
            <div className="grid-content content-community">
              <p>소통해요!</p>
              <h6>경험 공유 커뮤니티</h6>
            </div>
          </Link>

          <Link
            to="/map"
            className="grid-item grid-item--highlight"
            title="원하는 장소 검색"
            aria-label="🗺 지도에서 선택하고: 원하는 장소 검색"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <img src={mapsearch} alt="지도" />
            <div className="grid-content content-map">
              <p>어디로 갈까?</p>
              <h6>지도에서 찾아보기</h6>
            </div>
          </Link>

          <div
            onClick={openChat}
            className="grid-item grid-item--fourth"
            data-aos="fade-up"
            data-aos-delay="230"
            style={{ cursor: "pointer" }}
          >
            <img src={planner} alt="일정 관리" />
            <div className="grid-content content-planner">
              <p>도와드릴게요!</p>
              <h6>AI 여행 계획 도우미</h6>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Skills;