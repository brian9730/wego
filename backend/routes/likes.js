const express = require("express");
const router = express.Router();
const db = require("../index"); // DB 연결

// 특정 게시글의 저장 수 가져오기
router.get("/count/:post_id", async (req, res) => {
  const { post_id } = req.params;

  try {
    const [rows] = await db.promise().query(
      "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?",
      [post_id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("저장 수 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 게시글 저장
router.post("/", (req, res) => {
  const { user_id, post_id } = req.body;

  const sql = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) {
      console.error("저장 실패:", err);
      return res.status(500).json({ message: "DB 오류" });
    }

    res.status(201).json({ message: "게시글이 저장되었습니다!" });
  });
});

// 저장한 게시글 목록 가져오기
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT p.* FROM likes l JOIN posts p ON l.post_id = p.post_id WHERE l.user_id = ? ORDER BY l.created_at DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("저장한 글 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 저장 취소
router.delete("/:user_id/:post_id", async (req, res) => {
  const { user_id, post_id } = req.params;

  try {
    await db.promise().query(
      "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
      [user_id, post_id]
    );
    res.json({ message: "저장을 해체하였습니다" });
  } catch (err) {
    console.error("삭제 실패:", err);
    res.status(500).json({ message: "삭제 실패" });
  }
});

module.exports = router;
