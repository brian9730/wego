import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [regionType, setRegionType] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);

  const domesticRegions = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];
  const abroadRegions = ['아시아', '유럽', '북아메리카', '남아메리카', '아프리카', '오세아니아'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    /*if (!user || user.email !== 'admin@g.shingu.ac.kr') {
      alert('접근 권한이 없습니다.');
      navigate('/');
    }*/
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/posts');
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPosts(sorted);
      setFilteredPosts(sorted);
    } catch (error) {
      console.error('게시글 불러오기 실패:', error);
    }
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      const updatedPosts = posts.filter((post) => post.post_id !== postId);
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
      alert('삭제 완료되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleReset = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setRegionType('');
    setRegion('');
    setCategory('');
    setFilteredPosts(posts);
  };

  const handleSearch = () => {
    const filtered = posts.filter((post) => {
      return (
        (!searchTitle || post.name.toLowerCase().includes(searchTitle.toLowerCase())) &&
        (!searchAuthor || (post.author && post.author.toLowerCase().includes(searchAuthor.toLowerCase()))) &&
        (!regionType || post.region_type === regionType) &&
        (!region || post.region === region) &&
        (!category || post.category.includes(category))
      );
    });
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="admin-container">
      <h2>📋 관리자 페이지 - 게시글 관리</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 제목 검색"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="👤 작성자 검색"
          value={searchAuthor}
          onChange={(e) => setSearchAuthor(e.target.value)}
        />
        <select value={regionType} onChange={(e) => setRegionType(e.target.value)}>
          <option value="">--지역 구분--</option>
          <option value="domestic">국내</option>
          <option value="abroad">해외</option>
        </select>

        {regionType && (
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">--상세 지역--</option>
            {(regionType === 'domestic' ? domesticRegions : abroadRegions).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">--전체 카테고리--</option>
          <option value="여행">여행</option>
          <option value="맛집">맛집</option>
          <option value="자연">자연</option>
          <option value="역사">역사</option>
          <option value="관광지">관광지</option>
          <option value="음식점">음식점</option>
          <option value="숙박">숙박</option>
          <option value="축제">축제</option>
          <option value="레포츠">레포츠</option>
          <option value="교통">교통</option>
          <option value="쇼핑">쇼핑</option>
          <option value="문화">문화</option>
        </select>
        <button className="search-btn" onClick={handleSearch}>🔍 검색</button>
        <button className="reset-btn" onClick={handleReset}>♻ 초기화</button>
      </div>

      <p style={{ marginTop: '10px', fontSize: '14px' }}>
        총 <strong>{filteredPosts.length}</strong>개의 게시글이 검색되었습니다.
      </p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th style={{ textAlign: 'left' }}>제목</th>
            <th style={{ textAlign: 'left' }}>작성자</th>
            <th style={{ textAlign: 'left' }}>카테고리</th>
            <th>지역</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>게시글이 없습니다.</td></tr>
          ) : (
            currentPosts.map((post) => (
              <tr key={post.post_id}>
                <td>{post.post_id}</td>
                <td style={{ textAlign: 'left' }}>{post.name}</td>
                <td style={{ textAlign: 'left' }}>
                  {post.author || ''}
                  {post.email && <div style={{ fontSize: '12px', color: '#ccc' }}>{post.email}</div>}
                </td>
                <td style={{ textAlign: 'left' }}>
                  {post.category.split(',').map((cat, idx) => (
                    <span key={idx} className="badge">{cat}</span>
                  ))}
                </td>
                <td>{post.region_type === 'domestic' ? '국내' : '해외'} / {post.region}</td>
                <td>{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <Link to={`/post/${post.post_id}`}><button>상세 보기</button></Link>
                  <Link to={`/edit/${post.post_id}`}><button>수정</button></Link>
                  <button onClick={() => handleDelete(post.post_id)}>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
