import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../css/Setting.css';
import { FaSun, FaMoon, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Setting = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [accordion, setAccordion] = useState({
    privacy: false,
    terms: false,
  });

  const toggleAccordion = (key) => {
    setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="setting-page">
      {/* 페이지 라벨 */}
      <p className="page-label">⚙️Setting⚙️</p>
      {/* 다크모드 스위치 🌗*/}
      <div className="setting-header">
        <h2>테마 설정</h2>
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider">
            {darkMode ? <FaMoon className="icon" /> : <FaSun className="icon" />}
          </span>
        </label>
      </div>

      {/* 개인정보처리 안내 */}
      <div className="setting-card">
        <div className="accordion-header" onClick={() => toggleAccordion('privacy')}>
          <h4>📄 개인정보처리 안내</h4>
          {accordion.privacy ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {accordion.privacy && (
          <div className="accordion-body">
            <p>
              WE-GO는 이용자의 개인정보를 소중히 다루며, '개인정보 보호법' 등 관련 법령에 따라 안전하게 관리합니다. 
              수집 목적은 서비스 제공 및 개선에 국한되며, 동의 없이 제3자에게 제공되지 않습니다.
              이용자는 언제든지 자신의 정보에 대한 열람, 수정, 삭제를 요청할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* 이용약관 */}
      <div className="setting-card">
        <div className="accordion-header" onClick={() => toggleAccordion('terms')}>
          <h4>📘 이용약관</h4>
          {accordion.terms ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {accordion.terms && (
          <div className="accordion-body">
            <p>
              본 약관은 WE-GO 서비스를 이용하는 모든 사용자에게 적용되며, 
              이용자는 가입 또는 서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.
              서비스는 예고 없이 변경될 수 있으며, 변경 시 사전 공지를 원칙으로 합니다.
              자세한 내용은 전체 약관 문서를 참고해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;
