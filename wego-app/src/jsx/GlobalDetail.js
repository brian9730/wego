import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom'; //0527
import axios from 'axios';
import '../css/KoreaDetail.css';

const GlobalDetail = () => {
  const location = useLocation();
  const region = new URLSearchParams(location.search).get('region') || '국가명 없음';
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const { darkMode } = useTheme();
  const theme = darkMode ? 'dark' : 'light';

  const categories = [    
    '전체', '여행', '맛집', '자연', '역사',
    '관광지', '음식점', '숙박', '축제',
    '레포츠', '교통', '쇼핑', '문화'
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = {};
        if (selectedCategory !== '전체') params.category = selectedCategory;
        if (region !== '국가명 없음') params.region = region;

        const response = await axios.get('http://localhost:5000/api/posts', { params });
        setPosts(response.data);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchPosts();
  }, [selectedCategory, region]);

  return (
    <div className={`detail-container ${theme}`}>
      <h1 className="region-title offset-from-navbar">
        {region !== '국가명 없음' ? region : '선택된 국가가 없습니다.'}
      </h1>

      <div className="filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="post-list">
        {/* 0527 */}
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link to={`/post/${post.post_id}`} key={post.post_id} className="post-link">
              <div className="post-card">
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
            </Link>
          ))
        ) : (
          <p>등록된 코스가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default GlobalDetail;
