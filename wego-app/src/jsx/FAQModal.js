// src/jsx/FAQModal.js
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import '../css/FAQModal.css';

const FAQModal = ({ onClose }) => {
  // FAQ 목록: 질문 헤더에 번호만, 답변은 예시 내용으로 채워둠
  const [faqs, setFaqs] = useState([
    {
      question: '여행 준비는 어떻게 하나요?',
      answer: '여행 준비는 미리 계획하고 필요한 준비물을 여행 도우미 AI 위봇에게 질문하여 체크리스트를 확인해보세요.',
      isOpen: false
    },
    {
      question: '짐은 얼마나 싸야 하나요?',
      answer: '여행 기간과 목적에 맞게 필요한 짐만 챙기세요. 너무 많은 짐은 불편할 수 있습니다.',
      isOpen: false
    },
    {
      question: '현지에서의 안전은 어떻게 보장되나요?',
      answer: '여행 전 해당 지역의 안전 정보를 여행 도우미 AI 위봇에게 확인하고, 비상 연락망을 준비하세요.',
      isOpen: false
    },
    {
      question: '여행 중 식사는 어떻게 해결하나요?',
      answer: '현지 맛집 탐방과 안전한 식당 선택을 위해 WE-GO 사용자들이 직접 작성한 여행 게시글을 참고해보세요.',
      isOpen: false
    },
    {
      question: '여행 예산 관리는 어떻게 해야 하나요?',
      answer: '전체 예산을 미리 계획하고, 지출 내역을 꼼꼼히 관리하며 필요 시 여행 보험도 고려하세요.',
      isOpen: false
    },
    {
      question: '여행 중 예기치 못한 상황에 대처하려면?',
      answer: '여행 보험 가입, 비상 연락처 확보, 그리고 현지 응급 서비스 정보를 미리 파악해두세요.',
      isOpen: false
    }
  ]);  

  // 특정 FAQ의 isOpen 상태 토글
  const toggleFAQ = (index) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq, i) =>
        i === index ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  return (
    <div className="faq-modal-overlay" onClick={onClose}>
      <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="faq-modal-header">
          <h2>F&A</h2>
          <button className="faq-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="faq-modal-content">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h3 className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.question}
              </h3>
              <div className={`faq-answer ${faq.isOpen ? 'open' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
