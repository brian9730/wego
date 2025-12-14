const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'wego_db',
  port: 3306
});

// multer 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 썸네일 + 본문 이미지 여러 개 업로드 처리
const cpUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// ---------------------------
// 게시글 저장 라우터 (POST /api/posts)
// ---------------------------
router.post('/', cpUpload, (req, res) => {
  const { name, author, category, region_type, region, content, user_id } = req.body;

  const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].filename : '';
  const imageList = req.files['images'] ? req.files['images'].map(f => f.filename).join(',') : '';

  const sql = `INSERT INTO posts (name, author, category, region_type, region, image, content, user_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, author, category, region_type, region, thumbnail, content, user_id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB 저장 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }
    res.json({ message: '게시글 저장 성공', postId: result.insertId, images: imageList });
  });
});

// ---------------------------
// 게시글 목록 조회 라우터 (GET /api/posts)
// ---------------------------
router.get('/', (req, res) => {
  const category = req.query.category;
  const region = req.query.region;
  const user_id = req.query.user_id;

  let query = 'SELECT post_id, name, created_at, image, views FROM posts WHERE 1=1';
  const params = [];

  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }

  if (category && category !== '전체') {
    query += ' AND FIND_IN_SET(?, category)';
    params.push(category);
  }
  if (region) {
    query += ' AND region = ?';
    params.push(region);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('DB 조회 실패:', err);
      res.status(500).json({ message: '서버 오류' });
    } else {
      res.json(results);
    }
  });
});

// ---------------------------
// 게시글 상세 조회 + 조회수 증가 (GET /api/posts/:id)
// ---------------------------
router.get('/:id', (req, res) => {
  const postId = req.params.id;

  // 1) 조회수 1 증가
  const updateViewsSql = 'UPDATE posts SET views = IFNULL(views,0) + 1 WHERE post_id = ?';
  db.query(updateViewsSql, [postId], (err) => {
    if (err) {
      console.error('조회수 증가 실패:', err);
      return res.status(500).json({ error: '서버 에러 (조회수 증가 실패)' });
    }

    // 2) 게시글 상세 조회
    const sql = 'SELECT * FROM posts WHERE post_id = ?';
    db.query(sql, [postId], (err, results) => {
      if (err) {
        console.error('게시글 조회 실패:', err);
        return res.status(500).json({ error: '서버 에러' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      }

      res.json(results[0]);
    });
  });
});

// ---------------------------
// 게시글 삭제 라우터 (DELETE /api/posts/:id)
// ---------------------------
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM posts WHERE post_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('게시글 삭제 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }
    res.status(200).json({ message: '삭제 성공' });
  });
});

// ---------------------------
// 게시글 수정 라우터 (PUT /api/posts/:id)
// ---------------------------
router.put('/:id', upload.single('thumbnail'), (req, res) => {
  const postId = req.params.id;
  const { name, author, category, region_type, region, content, user_id } = req.body;
  const thumbnail = req.file ? req.file.filename : null;

  // 기존 이미지 가져오기
  const getImageSql = 'SELECT image FROM posts WHERE post_id = ?';
  db.query(getImageSql, [postId], (err, result) => {
    if (err) {
      console.error('기존 이미지 조회 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }

    const currentImage = result[0]?.image || '';
    const finalImage = thumbnail || currentImage;

    const sql = `
      UPDATE posts SET
        name = ?, author = ?, category = ?, region_type = ?, region = ?,
        image = ?, content = ?, user_id = ?
      WHERE post_id = ?
    `;
    const values = [name, author, category, region_type, region, finalImage, content, user_id, postId];

    db.query(sql, values, (err, updateResult) => {
      if (err) {
        console.error('게시글 수정 실패:', err);
        return res.status(500).json({ message: '수정 실패' });
      }
      res.status(200).json({ message: '게시글 수정 성공' });
    });
  });
});

// ---------------------------
// Toast UI Editor 내 이미지 업로드 라우터
// ---------------------------
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('파일 없음');
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;