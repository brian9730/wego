import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../css/AdminPage.css';

const AdminStats = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('회원 통계 로딩 실패:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('게시글 통계 로딩 실패:', err);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.is_admin).length;
  const memberCount = totalUsers - adminCount;

  const today = new Date().toISOString().slice(0, 10);
  const newUsersToday = users.filter(u => u.created_at && u.created_at.slice(0, 10) === today).length;

  const totalPosts = posts.length;
  const avgPostsPerUser = totalUsers > 0 ? (totalPosts / totalUsers).toFixed(1) : 0;

  const postCountsByUser = posts.reduce((acc, post) => {
    acc[post.author] = (acc[post.author] || 0) + 1;
    return acc;
  }, {});

  const topAuthors = Object.entries(postCountsByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const postsByDate = last7Days.map(date => ({
    date,
    count: posts.filter(p => p.created_at && p.created_at.slice(0, 10) === date).length
  }));

  const categoryStats = ['맛집', '자연', '여행', '역사'].map(cat => ({
    name: cat,
    count: posts.filter(p => p.category.includes(cat)).length
  }));

  const regionStats = [
    { name: '국내', count: posts.filter(p => p.region_type === 'domestic').length },
    { name: '해외', count: posts.filter(p => p.region_type === 'abroad').length }
  ];

  return (
    <div className="admin-container">
      <h2>📊 관리자 통계</h2>

      <div className="admin-cards">
        <div className="card">
          <h4>총 회원 수</h4>
          <p>{totalUsers}</p>
        </div>
        <div className="card">
          <h4>총 게시글 수</h4>
          <p>{totalPosts}</p>
        </div>
        <div className="card">
          <h4>오늘 가입자 수</h4>
          <p>{newUsersToday}</p>
        </div>
        <div className="card">
          <h4>평균 게시글 수</h4>
          <p>{avgPostsPerUser}</p>
        </div>
      </div>

      <section className="admin-section">
        <h3>👑 게시글 Top 작성자</h3>
        <ul className="admin-list">
          {topAuthors.map(([author, count], idx) => (
            <li key={idx}>{['🥇', '🥈', '🥉'][idx]} {author} - {count}건</li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h3>📅 최근 7일간 게시글 등록</h3>
        <div className="admin-chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postsByDate}>
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip wrapperStyle={{ backgroundColor: '#333', color: '#fff' }} />
              <Bar dataKey="count" fill="#ff8042" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-section">
        <h3>📝 게시글 카테고리 통계</h3>
        <div className="admin-chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip wrapperStyle={{ backgroundColor: '#333', color: '#fff' }} />
              <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-section">
        <h3>🌍 지역별 게시글</h3>
        <div className="admin-chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionStats}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip wrapperStyle={{ backgroundColor: '#333', color: '#fff' }} />
              <Bar dataKey="count" fill="#82ca9d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default AdminStats;
