const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'wego_db',
    port: 3306
});

// ✅ 전체 게시글 + 작성자 정보 포함 조회 (GET /api/admin/posts)
router.get('/posts', (req, res) => {
    const query = `
      SELECT posts.*, \`user\`.name AS author, \`user\`.email
      FROM posts
      LEFT JOIN \`user\` ON posts.user_id = \`user\`.id
      ORDER BY posts.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Admin 게시글 조회 오류:', err);
            return res.status(500).json({ message: '서버 오류', error: err });
        }
        res.json(results);
    });
});

// ✅ 최근 7일간 날짜별 게시글 수 (GET /api/admin/stats)
router.get('/stats', (req, res) => {
    const query = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS count
      FROM posts
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('통계 조회 실패:', err);
            return res.status(500).json({ error: '서버 오류' });
        }
        res.json(results);
    });
});

module.exports = router;
