import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../css/MyPage.css';

import profileDefault from "../images/profile.jpg";
import post1Image from "../images/post1.jpg";
import post2Image from "../images/post2.jpg";

import axios from 'axios';

const MyPage = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [selectedTab, setSelectedTab] = useState("posts");

  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({ post_count: 0, like_count: 0 });
  const [bio, setBio] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [myComments, setMyComments] = useState([]); // 추가

  const user = JSON.parse(localStorage.getItem("user"));
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("로그인이 필요합니다.");
      navigate("/joinus");
    } else {
      setUserId(user.id);
    }
  }, [navigate]);

  // 🔧 내가 쓴 댓글 불러오기
  useEffect(() => {
    const fetchMyComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/user/${userId}`);
        console.log("💬 내가 쓴 댓글:", res.data);
        setMyComments(res.data);
      } catch (err) {
        console.error("내 댓글 불러오기 실패:", err);
      }
    };
    if (userId) fetchMyComments();
  }, [userId]);

  // 🔧 저장한 글 불러오기
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/likes/${userId}`);
        console.log("💾 저장된 글:", res.data);
        setSavedPosts(res.data);
      } catch (err) {
        console.error("저장한 게시글 불러오기 실패:", err);
      }
    };
    if (userId) fetchSavedPosts();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:5000/api/pages/${userId}`)
      .then(res => {
        setUserInfo(res.data);
        setBio(res.data.bio);
      })
      .catch(err => console.error("페이지 정보 오류", err));

    axios.get(`http://localhost:5000/api/pages/${userId}/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error("통계 정보 오류", err));

    axios.get(`http://localhost:5000/api/posts?user_id=${userId}`)
      .then(res => setUserPosts(res.data))
      .catch(err => console.error("게시글 목록 오류", err));
  }, [userId]);

  if (!userInfo) return <p>로딩 중...</p>;

  const formatSNSLink = (platform, handle) => {
    if (!handle) return '연결되지 않음';
    const url = `https://${platform}.com/${handle}`;
    return <a href={url} target="_blank" rel="noopener noreferrer">@{handle}</a>;
  };

  return (
    <>
      <div className="container-custom">
        <aside className="sidebar">
          <h2 className="activity-title">나의 활동</h2>
          <div className="activity-bar"></div>

          <div className="profile-container">
            <div className="profile-img-wrapper">
              <img
                src={userInfo.profile_image
                  ? `http://localhost:5000/uploads/${userInfo.profile_image}`
                  : profileDefault
                }
                alt=""
                className="profile-img"
              />
            </div>

            <div className="profile-info">
              <div className="nickname-row">
                <p className="nickname">{userInfo.nickname}</p>
                <p className="fixed-nick">@{userInfo.fixed_nick}</p>
              </div>
              <p><strong>가입일:</strong> {new Date(userInfo.created_at).toLocaleDateString()}</p>
            </div>
            <div className="activity-bar2"></div>
          </div>

          <div className="profile-stats">
            <span>게시글 <strong>{stats.post_count}</strong></span>
            <span>저장 <strong>{stats.like_count}</strong></span>
          </div>

          <div className="sns-links">
            <div className="sns-text-links">
              <p>Instagram: {formatSNSLink('instagram', userInfo.sns_instagram)}</p>
              <p>Twitter: {formatSNSLink('twitter', userInfo.sns_twitter)}</p>
              <p>Facebook: {formatSNSLink('facebook', userInfo.sns_facebook)}</p>
            </div>
          </div>

          <div className="bio-box">
            <h3 className="bio-title">소개글</h3>
            <p className="bio-content">{bio || "소개글이 없습니다."}</p>
          </div>

          <button className="edit-profile-btn3" onClick={() => navigate('/post/new')}>
            게시글 작성
          </button>
          <button className="edit-profile-btn1" onClick={() => navigate('/editprofile')}>
            프로필 수정
          </button>
          <button className="edit-profile-btn2" onClick={() => navigate('/profile')}>
            비밀번호 변경
          </button>
        </aside>

        <section className="content center-tab">
          <div className="tab-buttons">
            <button onClick={() => setSelectedTab("posts")} className={selectedTab === "posts" ? "active" : ""}>📄</button>
            <button onClick={() => setSelectedTab("comments")} className={selectedTab === "comments" ? "active" : ""}>💬</button>
            <button onClick={() => setSelectedTab("saved")} className={selectedTab === "saved" ? "active" : ""}>💾</button>
          </div>

          {/* 내가 쓴 게시글 */}
          {selectedTab === "posts" && (
            <div className="grid">
              {userPosts.map(post => (
                <Link to={`/post/${post.post_id}`} key={post.post_id} className="saved-card">
                  <div className="saved-card-image-wrapper">
                    <img
                      src={post.image ? `http://localhost:5000/uploads/${post.image}` : post1Image}
                      alt={post.name}
                      className="saved-card-image"
                      onError={(e) => { e.target.src = post1Image; }}
                    />
                    <div className="saved-card-overlay">
                      <div className="saved-card-text">{post.name}</div>
                      <div className="saved-card-date">{new Date(post.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 내가 쓴 댓글 */}
          {selectedTab === "comments" && (
            <div className="comments-list">
              {myComments.length === 0 ? (
                <p>작성한 댓글이 없습니다.</p>
              ) : (
                myComments.map(comment => (
                  <div key={comment.comment_id} className="comment-card">
                    <Link to={`/post/${comment.post_id}`} className="comment-link">
                      <h4 className="comment-post-title">📌 {comment.post_title}</h4>
                      <p className="comment-text">💬 {comment.content}</p>
                      <p className="comment-date">
                        작성일: {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}


          {/* 내가 저장한 게시글 */}
          {selectedTab === "saved" && (
            <div className="grid">
              {savedPosts.map(post => (
                <Link to={`/post/${post.post_id}`} key={post.post_id} className="saved-card">
                  <div className="saved-card-image-wrapper">
                    <img
                      src={post.image ? `http://localhost:5000/uploads/${post.image}` : post2Image}
                      alt={post.name}
                      className="saved-card-image"
                      onError={(e) => { e.target.src = post2Image; }}
                    />
                    <div className="saved-card-overlay">
                      <div className="saved-card-text">{post.name}</div>
                      <div className="saved-card-date">{new Date(post.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default MyPage;
