import React, { useState, useEffect } from 'react';
import '../css/Exhibition.css';

export const Exhibition = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('서울');  // 기본 카테고리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // ✅ API 호출
  useEffect(() => {
    const fetchExhibitions = async () => {
      setLoading(true);
      try {
        // ✅ 백엔드 프록시 호출
        const response = await fetch(
          `http://localhost:5000/api/searchKeyword?keyword=전시`
        );
        const data = await response.json();

        const items = data.response?.body?.items?.item || [];
        setExhibitions(items);
        setFilteredExhibitions(items);
      } catch (error) {
        console.error("Failed to fetch exhibitions data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  // ✅ 카테고리 필터링
  const filterByCategory = (category) => {
    setSelectedCategory(category);

    const filtered = exhibitions.filter(
      exhibition => exhibition.addr1 && exhibition.addr1.includes(category)
    );
    setFilteredExhibitions(filtered);
    setCurrentPage(1);
  };

  // ✅ 페이지네이션 처리
  const currentExhibitions = filteredExhibitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage * itemsPerPage < filteredExhibitions.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="exhibition-page">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* ✅ 카테고리 버튼 */}
          <div className="category-buttons">
            <button onClick={() => filterByCategory('서울')} className={selectedCategory === '서울' ? 'active' : ''}>서울</button>
            <button onClick={() => filterByCategory('부산')} className={selectedCategory === '부산' ? 'active' : ''}>부산</button>
            <button onClick={() => filterByCategory('대구')} className={selectedCategory === '대구' ? 'active' : ''}>대구</button>
            <button onClick={() => filterByCategory('광주')} className={selectedCategory === '광주' ? 'active' : ''}>광주</button>
          </div>

          <h2>{selectedCategory} 전시 및 행사</h2>

          {/* ✅ 전시 리스트 */}
          <div className="exhibition-list">
            {currentExhibitions.map((exhibition) => (
              <div key={exhibition.contentid} className="exhibition-item">
                <img
                  src={exhibition.firstimage || 'https://via.placeholder.com/150'}
                  alt={exhibition.title}
                />
                <h4>{exhibition.title}</h4>
                <p>{exhibition.addr1}</p>
              </div>
            ))}
          </div>

          {/* ✅ 페이지네이션 버튼 */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              이전 페이지
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage * itemsPerPage >= filteredExhibitions.length}
            >
              다음 페이지
            </button>
          </div>
        </>
      )}
    </div>
  );
};
