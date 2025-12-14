const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// DB 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'wego_db',
  port: 3306,
});

// ✅ 전체 회원 조회
router.get('/', (req, res) => {
  const sql = 'SELECT id, name, email, is_admin, created_at FROM user ORDER BY is_admin DESC, created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('회원 목록 불러오기 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }
    res.json(results);
  });
});

// ✅ 회원 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM user WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('회원 삭제 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }
    res.json({ message: '삭제 성공' });
  });
});

// ✅ 관리자 권한 부여
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  const sql = 'UPDATE user SET is_admin = ? WHERE id = ?';
  db.query(sql, [is_admin, id], (err, result) => {
    if (err) return res.status(500).json({ message: '서버 오류' });
    res.json({ message: '권한 변경 성공' });
  });
});

module.exports = router;
