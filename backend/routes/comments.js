const express = require('express');
const router = express.Router();
const db = require('../index'); // index.js에서 db export 필요

// ---------------------------
// 내가 쓴 댓글 조회 (user 기준)
// 경로: GET /api/comments/user/:userId
// ---------------------------
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [comments] = await db.promise().query(
      `SELECT c.comment_id, c.content, c.created_at, c.post_id, p.name AS post_title
       FROM comments c
       JOIN posts p ON c.post_id = p.post_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json(comments);
  } catch (err) {
    console.error('내 댓글 조회 오류:', err);
    res.status(500).json({ message: '내 댓글 불러오기 실패' });
  }
});

// ---------------------------
// 특정 게시글 댓글 조회 (post 기준)
// 경로: GET /api/comments/:postId
// ---------------------------
router.get('/:postId', async (req, res) => {
  const postId = req.params.postId;
  const currentUserId = req.session?.user_id || null; // 로그인 사용자 ID

  try {
    const [comments] = await db.promise().query(
      `SELECT 
         c.comment_id,
         c.content,
         c.created_at,
         u.name AS nickname,
         c.user_id,
         p.user_id AS post_user_id
       FROM comments c
       JOIN user u ON c.user_id = u.id
       JOIN posts p ON c.post_id = p.post_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    // 프론트에서 바로 쓸 수 있도록 가공
    const formatted = comments.map(c => ({
      comment_id: c.comment_id,
      content: c.content,
      created_at: c.created_at,
      nickname: c.user_id === c.post_user_id ? "작성자" : c.nickname,
      isOwner: currentUserId && c.user_id === currentUserId,
      user_id: c.user_id,
      post_user_id: c.post_user_id
    }));

    res.json(formatted);
  } catch (err) {
    console.error('댓글 조회 오류:', err);
    res.status(500).json({ message: '댓글 조회 실패' });
  }
});

// ---------------------------
// 댓글 작성
// 경로: POST /api/comments
// body: { post_id, user_id, content }
// ---------------------------
router.post('/', async (req, res) => {
  const { post_id, user_id, content } = req.body;
  if (!post_id || !user_id || !content) {
    return res.status(400).json({ message: '필수 값이 없습니다.' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES (?, ?, ?)`,
      [post_id, user_id, content]
    );

    res.status(201).json({ message: '댓글 작성 성공', comment_id: result.insertId });
  } catch (err) {
    console.error('댓글 작성 오류:', err);
    res.status(500).json({ message: '댓글 작성 실패' });
  }
});

// ---------------------------
// 댓글 수정
// 경로: PUT /api/comments/:commentId
// body: { content }
// ---------------------------
router.put('/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ message: '내용이 필요합니다.' });

  try {
    await db.promise().query(
      `UPDATE comments SET content = ? WHERE comment_id = ?`,
      [content, commentId]
    );
    res.json({ message: '댓글 수정 성공' });
  } catch (err) {
    console.error('댓글 수정 오류:', err);
    res.status(500).json({ message: '댓글 수정 실패' });
  }
});

// ---------------------------
// 댓글 삭제
// 경로: DELETE /api/comments/:commentId
// ---------------------------
router.delete('/:commentId', async (req, res) => {
  const { commentId } = req.params;

  try {
    await db.promise().query(
      `DELETE FROM comments WHERE comment_id = ?`,
      [commentId]
    );
    res.json({ message: '댓글 삭제 성공' });
  } catch (err) {
    console.error('댓글 삭제 오류:', err);
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
});

module.exports = router;