import React from 'react';
import { Link } from 'react-router-dom';
import '../css/AdminHome.css';

const AdminHome = () => {
  return (
    <div className="admin-home-container">
      <h2>🛠️ 관리자 대시보드</h2>
      <div className="admin-menu-grid">
        <Link to="/admin/posts" className="admin-card">
          <h3>📋 게시글 관리</h3>
          <p>전체 게시글을 조회, 검색, 삭제할 수 있습니다.</p>
        </Link>
        <Link to="/admin/users" className="admin-card">
          <h3>👤 회원 관리</h3>
          <p>가입한 회원 목록을 확인하고 관리할 수 있습니다.</p>
        </Link>
        <Link to="/admin/stats" className="admin-card">
          <h3>📊 통계 보기</h3>
          <p>게시글 및 회원 관련 통계를 확인합니다.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminHome;
