const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

// DB 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'wego_db',
  port: 3306,
});

// ✅ multer 설정 (uploads 폴더에 이미지 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ GET /api/page/:user_id → 페이지 정보 조회
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT user_id, nickname, fixed_nick, profile_image, bio,
           sns_instagram, sns_twitter, sns_facebook, created_at
    FROM page WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: '서버 오류' });
    if (results.length === 0) return res.status(404).json({ message: '사용자 정보 없음' });
    res.json(results[0]);
  });
});

// ✅ PUT /api/page/:user_id → 페이지 정보 수정 (이미지 포함)
router.put('/:user_id', upload.single('profile_image'), (req, res) => {
  const { user_id } = req.params;
  const {
    fixed_nick,
    bio,
    sns_instagram,
    sns_twitter,
    sns_facebook
  } = req.body;

  const profile_image = req.file ? req.file.filename : req.body.profile_image || '';

  const sql = `
    UPDATE page SET
      fixed_nick = ?,
      profile_image = ?,
      bio = ?,
      sns_instagram = ?,
      sns_twitter = ?,
      sns_facebook = ?
    WHERE user_id = ?
  `;

  db.query(sql, [fixed_nick, profile_image, bio, sns_instagram, sns_twitter, sns_facebook, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: '업데이트 실패' });
    res.json({ message: '수정 완료' });
  });
});

// ✅ GET /api/page/:user_id/stats → 작성/저장 글 수
router.get('/:user_id/stats', (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM posts WHERE user_id = ?) AS post_count,
      (SELECT COUNT(*) FROM likes WHERE user_id = ?) AS like_count
  `;

  db.query(sql, [user_id, user_id], (err, results) => {
    if (err) {
      console.error("통계 쿼리 오류:", err);  // 터미널에 오류 뜰 경우 여기 찍힘
      return res.status(500).json({ message: "통계 로딩 실패" });
    }
    res.json(results[0]);  // { post_count: 3, like_count: 12 } 형식으로 전달됨
  });
});


module.exports = router;
