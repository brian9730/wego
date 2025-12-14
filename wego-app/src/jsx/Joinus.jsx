
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // 라우터 훅 import
// import "../css/Joinus.css";

// const Joinus = () => {
//   const [isRightPanelActive, setIsRightPanelActive] = useState(false);
//   const navigate = useNavigate(); // 뒤로가기 또는 홈 이동용

//   return (
//     <div className="joinus-root">
//       {/* 닫기 버튼 (오른쪽 상단) */}
//       <button className="joinus-close-button" onClick={() => navigate("/")}>
//         &times;
//       </button>

//       <div className="joinus-banner">
//         <div
//           className={`joinus-container ${
//             isRightPanelActive ? "right-panel-active" : ""
//           }`}
//           id="main"
//         >
//           {/* 회원가입 */}
//           <div className="joinus-sign-up">
//             <form
//               action="inc/signup.php"
//               method="POST"
//               className="joinus-form joinus-form-signup"
//             >
//               <h1 className="joinus-h1">Create Account</h1>
//               <div className="joinus-social-container">
//                 <a href="https://www.facebook.com" className="joinus-social">
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//                 <a href="https://www.google.com" className="joinus-social">
//                   <i className="fab fa-google-plus-g"></i>
//                 </a>
//                 <a href="https://www.linkedin.com" className="joinus-social">
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               </div>
//               <p className="joinus-p">or use your email for registration</p>
//               <input
//                 className="joinus-input"
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 required
//               />
//               <input
//                 className="joinus-input"
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 required
//               />
//               <input
//                 className="joinus-input"
//                 type="password"
//                 name="pwd"
//                 placeholder="Password"
//                 required
//               />
//               <button className="joinus-button joinus-button-signup" type="submit">
//                 Sign Up
//               </button>
//             </form>
//           </div>

//           {/* 로그인 */}
//           <div className="joinus-sign-in">
//             <form action="inc/login.php" method="POST" className="joinus-form">
//               <h1 className="joinus-h1-signin">Sign in</h1>
//               <div className="joinus-social-container">
//                 <a href="https://www.facebook.com" className="joinus-social">
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//                 <a href="https://www.google.com" className="joinus-social">
//                   <i className="fab fa-google-plus-g"></i>
//                 </a>
//                 <a href="https://www.linkedin.com" className="joinus-social">
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               </div>
//               <p className="joinus-p">or use your email for registration</p>
//               <input
//                 className="joinus-input"
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 required
//               />
//               <input
//                 className="joinus-input"
//                 type="password"
//                 name="pwd"
//                 placeholder="Password"
//                 required
//               />
//               <button className="joinus-button" type="submit">
//                 Sign In
//               </button>
//             </form>
//           </div>

//           {/* 오버레이 */}
//           <div className="joinus-overlay-container">
//             <div className="joinus-overlay">
//               <div className="joinus-overlay-left">
//                 <h1 className="joinus-h1">Welcome Back!</h1>
//                 <p className="joinus-p">
//                   To keep connected with us please login with your personal info
//                 </p>
//                 <button
//                   className="joinus-button joinus-signIn"
//                   onClick={() => setIsRightPanelActive(false)}
//                 >
//                   Sign In
//                 </button>
//               </div>
//               <div className="joinus-overlay-right">
//                 <h1 className="joinus-h1">Hello, Friend!</h1>
//                 <p className="joinus-p">
//                   Enter your personal details and start your journey with us
//                 </p>
//                 <button
//                   className="joinus-button joinus-signUp"
//                   onClick={() => setIsRightPanelActive(true)}
//                 >
//                   Sign Up
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Joinus;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Joinus.css";


const Joinus = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();

  // 회원가입 요청
  const handleSignup = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.pwd.value;

    try {
      await axios.post('http://localhost:5000/signup', { name, email, password });
      alert('회원가입 성공! 로그인 해주세요.');
      setIsRightPanelActive(false); // 가입 후 로그인 화면으로 전환
    } catch (error) {
      console.error(error);
      alert('회원가입 실패: ' + (error.response?.data?.message || '서버 에러'));
    }
  };

  // 로그인 요청
  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.pwd.value;

    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      if (res.status === 200) {
        const user = res.data.user;
        localStorage.setItem('user', JSON.stringify(user)); // 로그인 정보 저장
        alert('로그인 성공!');
        navigate('/'); // 메인 페이지로 이동
      }
    } catch (error) {
      console.error(error);
      alert('로그인 실패: ' + (error.response?.data?.message || '서버 에러'));
    }
  };

  return (
    <div className="joinus-root">
      {/* 닫기 버튼 */}
      <button
  type="button"
  className="joinus-close-button"
  onClick={(e) => {
    e.preventDefault();  // 혹시 모를 submit 방지
    navigate("/");       // 홈으로 이동
  }}
>
  &times;
</button>


      <div className="joinus-banner">
        <div
          className={`joinus-container ${isRightPanelActive ? "right-panel-active" : ""}`}
          id="main"
        >
          {/* 회원가입 폼 */}
          <div className="joinus-sign-up">
            <form onSubmit={handleSignup} className="joinus-form joinus-form-signup">
              <h1 className="joinus-h1">Create Account</h1>
              <div className="joinus-social-container">
                <a href="https://www.facebook.com" className="joinus-social">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.google.com" className="joinus-social">
                  <i className="fab fa-google-plus-g"></i>
                </a>
                <a href="https://www.linkedin.com" className="joinus-social">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              <p className="joinus-p">or use your email for registration</p>
              <input className="joinus-input" type="text" name="name" placeholder="Name" required />
              <input className="joinus-input" type="email" name="email" placeholder="Email" required />
              <input className="joinus-input" type="password" name="pwd" placeholder="Password" required />
              <button className="joinus-button joinus-button-signup" type="submit">
                Sign Up
              </button>
            </form>
          </div>

          {/* 로그인 폼 */}
          <div className="joinus-sign-in">
            <form onSubmit={handleLogin} className="joinus-form">
              <h1 className="joinus-h1-signin">Sign in</h1>
              <div className="joinus-social-container">
                <a href="https://www.facebook.com" className="joinus-social">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.google.com" className="joinus-social">
                  <i className="fab fa-google-plus-g"></i>
                </a>
                <a href="https://www.linkedin.com" className="joinus-social">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              <p className="joinus-p">or use your email for registration</p>
              <input className="joinus-input" type="email" name="email" placeholder="Email" required />
              <input className="joinus-input" type="password" name="pwd" placeholder="Password" required />
              <button className="joinus-button" type="submit">
                Sign In
              </button>
            </form>
          </div>

          {/* 오버레이 */}
          <div className="joinus-overlay-container">
            <div className="joinus-overlay">
              <div className="joinus-overlay-left">
                <h1 className="joinus-h1">Welcome Back!</h1>
                <p className="joinus-p">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="joinus-button joinus-signIn"
                  onClick={() => setIsRightPanelActive(false)}
                >
                  Sign In
                </button>
              </div>
              <div className="joinus-overlay-right">
                <h1 className="joinus-h1">Hello, Friend!</h1>
                <p className="joinus-p">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  className="joinus-button joinus-signUp"
                  onClick={() => setIsRightPanelActive(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Joinus;
