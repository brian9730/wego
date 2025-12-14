import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminPage.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('회원 목록 불러오기 실패:', error);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('정말 해당 회원을 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      alert('삭제 완료');
    } catch (error) {
      console.error('회원 삭제 실패:', error);
    }
  };

  const handlePromote = async (userId, userName, promoteToAdmin) => {
    const actionText = promoteToAdmin ? '관리자로 임명' : '일반회원으로 변경';
    const confirmText = `'${userName}' 사용자를 ${actionText}하시겠습니까?`;
    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    try {
      await axios.patch(`http://localhost:5000/api/users/${userId}`, { is_admin: promoteToAdmin });
      fetchUsers();
      alert(`${actionText} 완료`);
    } catch (error) {
      console.error('권한 변경 실패:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      (!searchName || user.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (!searchEmail || user.email.toLowerCase().includes(searchEmail.toLowerCase()))
    );
  });

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="admin-container">
      <h2>👤 회원 관리</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 이름 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="📧 이메일 검색"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>회원이 없습니다.</td></tr>
          ) : (
            currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.is_admin ? '관리자' : '일반회원'}</td>
                <td>{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button onClick={() => handleDelete(user.id)}>삭제</button>
                  {user.is_admin ? (
                    <button onClick={() => handlePromote(user.id, user.name, false)}>권한 회수</button>
                  ) : (
                    <button onClick={() => handlePromote(user.id, user.name, true)}>관리자 임명</button>
                  )}
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

export default AdminUsers;
