import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/KoreaDetail.css';
import { useTheme } from '../context/ThemeContext';

const KoreaDetail2 = () => {
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region');
  const [places, setPlaces] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('전체');
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const theme = darkMode ? 'dark' : 'light';

  const typeMap = {
    '관광지': 12,
    '음식점': 39,
    '숙박': 32,
    '축제': 15,
    '레포츠': 28,
  };

  const userCategories = [
    '전체', '여행', '맛집', '자연', '역사',
    '관광지', '음식점', '숙박', '축제',
    '레포츠', '교통', '쇼핑', '문화'
  ];

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const areaCode = getAreaCode(region);
        const contentTypeId = typeMap[selectedType];

        if (!contentTypeId && selectedType !== '전체') {
          setPlaces([]);
          return;
        }

        // ✅ 백엔드 프록시 호출
        let url = `http://localhost:5000/api/areaBased?areaCode=${areaCode}`;
        if (contentTypeId) url += `&contentTypeId=${contentTypeId}`;

        const response = await axios.get(url);
        const items = response?.data?.response?.body?.items?.item || [];
        setPlaces(items);
      } catch (err) {
        console.error('공공데이터 관광지 API 오류:', err);
        setPlaces([]);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const params = { region };
        if (selectedType !== '전체') params.category = selectedType;

        const res = await axios.get('http://localhost:5000/api/posts', { params });
        setUserPosts(res.data);
      } catch (err) {
        console.error('DB 게시글 불러오기 실패:', err);
      }
    };

    if (region) {
      fetchTourData();
      fetchUserPosts();
    } else {
      setPlaces([]);
    }
  }, [region, selectedType]);

  const getAreaCode = (region) => {
    const map = {
      '서울특별시': 1, '부산광역시': 6, '대구광역시': 4,
      '인천광역시': 2, '광주광역시': 5, '대전광역시': 3,
      '울산광역시': 7, '세종특별자치시': 8, '경기도': 31,
      '강원도': 32, '충청북도': 33, '충청남도': 34,
      '전라북도': 35, '전라남도': 36, '경상북도': 37,
      '경상남도': 38, '제주특별자치도': 39
    };
    return map[region] || 1;
  };

  const filteredPlaces = searchKeyword
    ? places.filter(place => place.title.toLowerCase().includes(searchKeyword.toLowerCase()))
    : places;

  const placesPerPage = 9;
  const indexOfLastPlace = page * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = filteredPlaces.slice(indexOfFirstPlace, indexOfLastPlace);
  const totalPages = Math.ceil(filteredPlaces.length / placesPerPage);

  return (
    <div className={`detail-container ${theme}`}>
      <h1 className="region-title">{region || '지역명 없음'}</h1>

      <div className="filter-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {userCategories.map((type) => (
          <button
            key={type}
            className={`filter-btn ${selectedType === type ? 'active' : ''}`}
            onClick={() => {
              setSelectedType(type);
              setPage(1);
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <input
          type="text"
          placeholder="관광지명 검색"
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setPage(1);
          }}
          style={{ padding: '8px', width: '240px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      <h2>📍 {selectedType} 정보</h2>
      <div className="post-list">
        {currentPlaces.length > 0 ? (
          currentPlaces.map((place) => (
            <div
              className="post-card"
              key={place.contentid}
              onClick={() => navigate(`/detail/${place.contentid}`)}
            >
              <img
                src={place.firstimage || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={place.title}
                className="post-image"
              />
              <div className="post-card-content">
                <div className="post-card-title">{place.title}</div>
                <div className="post-card-category">주소: {place.addr1}</div>
              </div>
            </div>
          ))
        ) : (
          <p>데이터가 없습니다.</p>
        )}
      </div>

      <div className="pagination-controls" style={{ textAlign: 'center', margin: '30px 0' }}>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>이전</button>
        <span style={{ margin: '0 12px' }}>{page} / {totalPages} 페이지</span>
        <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>다음</button>
      </div>

      <h2 style={{ marginTop: '60px' }}>📝 사용자 작성 코스</h2>
      <div className="post-list">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div
              className="post-card"
              key={post.post_id}
              onClick={() => navigate(`/post/${post.post_id}`)}
            >
              <img
                src={`http://localhost:5000/uploads/${post.image}`}
                alt={post.name}
                className="post-image"
              />
              <div className="post-card-content">
                <div className="post-card-title">{post.name}</div>
                <div className="post-card-category">카테고리: {post.category}</div>
                <div className="post-card-author">작성자: {post.author}</div>
              </div>
            </div>
          ))
        ) : (
          <p>등록된 사용자 코스가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default KoreaDetail2;
