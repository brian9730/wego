import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import "../css/PostDetail.css";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const theme = darkMode ? "dark" : "light";
  const [post, setPost] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchBookmarkCount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/likes/count/${id}`
        );
        setBookmarkCount(res.data.count);
      } catch (err) {
        console.error("북마크 수 가져오기 실패:", err);
      }
    };

    fetchBookmarkCount();
  }, [id, isSaved]); // isSaved가 바뀔 때마다 다시 가져오도록

  useEffect(() => {
    if (user) {
      const checkSaved = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/likes/${user.id}`
          );
          const saved = res.data.some((sp) => sp.post_id === Number(id));
          setIsSaved(saved);
        } catch (err) {
          console.error("저장 상태 확인 실패:", err);
        }
      };
      checkSaved();
    }
  }, [id, user]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("게시글 조회 실패:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch (err) {
        console.error("댓글 불러오기 실패:", err);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "정말로 이 게시글을 삭제하시겠습니까?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      alert("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  if (!post) return <div className={`post-detail ${theme}`}>로딩 중...</div>;

  const isEditable = user && (user.id === post?.user_id || user?.is_admin);

  const getBackLink = () => {
    if (!post || !post.region_type) return "/";
    return post.region_type === "domestic"
      ? `/map/korea/detail2?region=${post.region}`
      : `/map/global/detail?region=${post.region}`;
  };

  const handleSave = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isSaved) {
        await axios.delete(`http://localhost:5000/api/likes/${user.id}/${id}`);
        setIsSaved(false);
        setBookmarkCount((prev) => prev - 1); // 저장 취소 시 -1
        alert("저장을 취소하였습니다");
      } else {
        await axios.post("http://localhost:5000/api/likes", {
          user_id: user.id,
          post_id: id,
        });
        setIsSaved(true);
        setBookmarkCount((prev) => prev + 1); // 저장 시 +1
        alert("게시글이 저장되었습니다!");
      }
    } catch (err) {
      console.error(
        "저장/취소 실패:",
        err.response?.data || err.message || err
      );
      alert("작업에 실패했습니다.");
    }
  };

  // 🔹 댓글 작성
  const handleCommentSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/comments", {
        post_id: id,
        user_id: user.id,
        content: newComment,
      });

      setNewComment("");
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // 🔹 댓글 수정
  const handleUpdateComment = async (commentId) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!editContent.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/comments/${commentId}`, {
        content: editContent,
      });

      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);

      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error("댓글 수정 실패:", err);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 🔹 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const confirmDelete = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  if (!post) return <div className={`post-detail ${theme}`}>로딩 중...</div>;

  // 공유 버튼 구현 0910
  const handleShare = async () => {
    const shareUrl = window.location.href; // 현재 페이지 URL
    try {
      if (navigator.share) {
        // 모바일 브라우저 기본 공유 기능
        await navigator.share({
          title: post.name,
          text: "유용한 여행 게시글을 공유합니다 ✈️",
          url: shareUrl,
        });
      } else {
        // 지원 안 되면 클립보드 복사
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다!");
      }
    } catch (err) {
      console.error("공유 실패:", err);
    }
  };

  return (
    <div className={`post-detail ${theme}`}>
      <button className="back-button" onClick={() => navigate(getBackLink())}>
        ← 목록으로
      </button>

      <h2 className="post-title">{post.name}</h2>

      {post.image && (
        <img
          src={`http://localhost:5000/uploads/${post.image}`}
          alt="썸네일"
          className="post-thumbnail"
        />
      )}
      <p>조회수: {post.views}</p>
      <p className="post-meta">
        작성자: {post.author} | 지역: {post.region} | 카테고리: {post.category}
      </p>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{
          __html: post.content
            ? post.content.replace(/style\s*=\s*"(.*?)"/gi, "")
            : "",
        }}
      />

      <div className="action-buttons">
        <button className="save-button" onClick={handleSave}>
          <span className="material-icons">
            {isSaved ? "bookmark" : "bookmark_border"}
          </span>
          <span className="save-text">{isSaved ? "저장 취소" : "저장"}</span>
          <span className="bookmark-count">({bookmarkCount})</span>
        </button>

        <button className="share-button" onClick={handleShare}>
          <span className="material-icons">share</span>
          <span className="share-text">공유하기</span>
        </button>
      </div>

      {isEditable && (
        <div className="post-edit-buttons">
          <button onClick={handleEdit}>✏ 수정</button>
          <button onClick={handleDelete}>🗑 삭제</button>
        </div>
      )}

      {/* 🔹 댓글 섹션 */}
      <div className="comments-section">
        <h4>댓글 ({comments.length})</h4>

        {comments.map((c) => (
          <div key={c.comment_id} className="comment-card">
            <div className="comment-header">
              <span className="comment-author">
                {c.user_id === Number(post.user_id) ? "작성자" : c.nickname}
              </span>
              <span className="comment-date">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>

            {editingCommentId === c.comment_id ? (
              <div className="comment-edit">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="comment-edit-buttons">
                  <button
                    className="btn-save"
                    onClick={() => handleUpdateComment(c.comment_id)}
                  >
                    💾 저장
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingCommentId(null)}
                  >
                    ❌ 취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-text">💬 {c.content}</p>
            )}

            {user &&
              user.id === c.user_id &&
              editingCommentId !== c.comment_id && (
                <div className="comment-actions">
                  <button
                    onClick={() => {
                      setEditingCommentId(c.comment_id);
                      setEditContent(c.content);
                    }}
                  >
                    ✏ 수정
                  </button>
                  <button onClick={() => handleDeleteComment(c.comment_id)}>
                    🗑 삭제
                  </button>
                </div>
              )}
          </div>
        ))}

        {/* 새 댓글 작성 */}
        <div className="new-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
          />
          <button onClick={handleCommentSubmit}>작성</button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
