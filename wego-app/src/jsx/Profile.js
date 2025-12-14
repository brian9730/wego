// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../css/Joinus.css"; // joinus.css 재활용


// const Profile = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [name, setName] = useState('');
//   const [password, setPassword] = useState('');

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       setUser(parsedUser);
//       setName(parsedUser.name);
//     } else {
//       alert('로그인이 필요합니다.');
//       navigate('/joinus');
//     }
//   }, [navigate]);

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     if (!name && !password) {
//       alert('변경할 내용을 입력하세요.');
//       return;
//     }

//     try {
//       await axios.put(`http://localhost:5000/update/${user.id}`, {
//         name,
//         password,
//       });

//       const updatedUser = { ...user, name };
//       localStorage.setItem('user', JSON.stringify(updatedUser));
//       setUser(updatedUser);

//       alert('회원정보가 수정되었습니다.');
//       navigate('/');
//     } catch (error) {
//       console.error(error);
//       alert('회원정보 수정 실패: ' + (error.response?.data?.message || '서버 에러'));
//     }
//   };

//   const handleDelete = async () => {
//     const confirmDelete = window.confirm('정말 탈퇴하시겠습니까?');
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`http://localhost:5000/user/${user.id}`);
//       alert('회원 탈퇴가 완료되었습니다.');
//       localStorage.removeItem('user');
//       navigate('/');
//     } catch (error) {
//       console.error(error);
//       alert('회원 탈퇴 실패: ' + (error.response?.data?.message || '서버 에러'));
//     }
//   };

//   return (
//     <div className="joinus-root">
//       {/* 닫기 버튼 */}
//       <button className="joinus-close-button" onClick={() => navigate("/")}>
//         &times;
//       </button>

//       <div className="joinus-banner">
//         <div className="joinus-container" id="main">
//           {/* 왼쪽 (회원 수정폼) */}
//           <div className="joinus-sign-up">
//             <form onSubmit={handleUpdate} className="joinus-form joinus-form-signup">
//               <h1 className="joinus-h1">Edit Profile</h1>
//               <p className="joinus-p">수정할 정보를 입력하세요</p>

//               <input
//                 className="joinus-input"
//                 type="text"
//                 name="name"
//                 placeholder="이름 변경"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />

//               <input
//                 className="joinus-input"
//                 type="password"
//                 name="password"
//                 placeholder="새 비밀번호 (선택)"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <button className="joinus-button joinus-button-signup" type="submit">
//                 수정하기
//               </button>

//               <button
//                 className="joinus-button joinus-button-signup"
//                 type="button"
//                 style={{ backgroundColor: 'red', marginTop: '10px' }}
//                 onClick={handleDelete}
//               >
//                 회원 탈퇴
//               </button>
//             </form>
//           </div>

//           {/* 오른쪽 (비워놓되 구조만 유지) */}
//           <div className="joinus-sign-in">
//             {/* 비워둠 */}
//           </div>

//           {/* 오버레이 (구조만 유지) */}
//           <div className="joinus-overlay-container">
//             <div className="joinus-overlay">
//               {/* 오버레이 안에 아무것도 안 넣어도 돼 */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Joinus.css";     // 공통 스타일
import "../css/Profile.css";   // 필요 시 커스터마이징용 스타일

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name);
    } else {
      alert('로그인이 필요합니다.');
      navigate('/joinus');
    }
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name && !password) {
      alert('변경할 내용을 입력하세요.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/update/${user.id}`, { name, password });
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('회원정보가 수정되었습니다.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('회원정보 수정 실패: ' + (error.response?.data?.message || '서버 에러'));
    }
  };


  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말 탈퇴하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/user/${user.id}`);
      alert('회원 탈퇴가 완료되었습니다.');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('회원 탈퇴 실패: ' + (error.response?.data?.message || '서버 에러'));
    }
  };

  return (
    <div className="joinus-root">
      <button className="joinus-close-button" onClick={() => navigate("/")}>
        &times;
      </button>

      <div className="joinus-banner">
        <div className="joinus-container" id="main">
          {/* 수정 폼 (왼쪽) */}
          <div className="joinus-sign-in">
            <form onSubmit={handleUpdate} className="joinus-form">
              <h1 className="joinus-h1-signin">Edit Profile</h1>
              <p className="joinus-p">회원 정보를 수정하세요</p>

              <input
                className="joinus-input"
                type="text"
                name="name"
                placeholder="이름 변경"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="joinus-input"
                type="password"
                name="password"
                placeholder="새 비밀번호 (선택)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button className="joinus-button" type="submit">
                수정하기
              </button>

              <button
                className="joinus-button"
                type="button"
                style={{ backgroundColor: 'red', marginTop: '10px' }}
                onClick={handleDelete}
              >
                회원 탈퇴
              </button>
            </form>
          </div>

          {/* 오버레이 (오른쪽) */}
          <div className="joinus-overlay-container">
            <div className="joinus-overlay">
              <div className="joinus-overlay-right">
                <h1 className="joinus-h1">Welcome!</h1>
                <p className="joinus-p">
                  프로필을 수정하고<br />더 나은 서비스를 경험하세요
                </p>
                <button
                  className="joinus-button joinus-signIn"
                  onClick={() => navigate("/")}
                >
                  홈으로
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
