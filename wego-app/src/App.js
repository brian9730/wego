import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

// 공통 컴포넌트
import { NavBar } from './jsx/NavBar';
import { Banner } from './jsx/Banner';
import { Skills } from './jsx/Skills';
import Adv from './jsx/Adv';
import { Projects } from './jsx/Projects';
import { Contact } from './jsx/Contact';
import { Footer } from './jsx/Footer';

// 사용자 페이지
import About from './jsx/About';
import Setting from './jsx/Setting';
import Map from './jsx/Map';
import KoreaMap from './jsx/KoreaMap';
import GlobalMap from './jsx/GlobalMap';
import KoreaDetail from './jsx/KoreaDetail';
import KoreaDetail2 from './jsx/KoreaDetail2';
import GlobalDetail from './jsx/GlobalDetail';
import PostForm from './jsx/PostForm';
import AdminPage from './jsx/AdminPage';
import AdminHome from './jsx/AdminHome';
import AdminUsers from './jsx/AdminUsers';
import AdminStats from './jsx/AdminStats';
import PostDetail from './jsx/PostDetail';
import PlaceDetail from './jsx/PlaceDetail';
import EditPost from './jsx/EditPost';

// 로그인/회원가입/프로필
import Joinus from './jsx/Joinus';
import Profile from './jsx/Profile';

// 마이페이지
import MyPage from './jsx/MyPage';
import EditProfile from './jsx/EditProfile';

// 스크롤 설정
import ScrollToTop from './jsx/ScrollToTop';

// 기타 페이지
import { CalendarPage } from './jsx/CalendarPage';
import EventDetailPage from './jsx/EventDetailPage';
import Seoulsup from './jsx/Seoulsup';
import CafeDetail from './jsx/CafeDetail';

// 날씨
import Weather2 from "./jsx/Weather2";


// 커스텀 커서
import Cursor from "./jsx/Cursor";

// 지하철
import SubwayMap from './jsx/SubwayMap';
import StationDetail from "./jsx/StationDetail";

function SmoothScroll() {
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const scrollAmount = e.deltaY * 0.3;
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return null;
}

function App() {
  const location = useLocation();
  const isFullPage = location.pathname === '/joinus' || location.pathname === '/profile';
  const user = JSON.parse(localStorage.getItem('user'));

  const lat = 37.3757;
  const lon = 127.2570;

  // ✅ 전역 챗봇 열림 상태
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="App">
        <Cursor />
        <ScrollToTop />
        {!isFullPage && <NavBar />}

        <Routes>
          {/* 메인 홈페이지 */}
          <Route
            path="/"
            element={
              <>
                <Banner />
                <Skills openChat={() => setIsChatOpen(true)} />

                <Adv />
                <Projects />

                <Footer />
              </>
            }
          />

          {/* 추가 페이지들 */}
          <Route path="/about" element={<><About /><Footer /></>} />
          <Route path="/setting" element={<><Setting /><Footer /></>} />
          <Route path="/map" element={<Navigate to="/map/korea" replace />} />
          <Route path="/map/korea" element={<KoreaMap />} />
          {/* <Route path="/map/global" element={<GlobalMap />} /> */}
          <Route path="/map/korea/detail" element={<KoreaDetail />} />
          <Route path="/map/korea/detail2" element={<KoreaDetail2 />} />
          <Route path="/map/global/detail" element={<GlobalDetail />} />
          <Route path="/detail/:contentid" element={<PlaceDetail />} />

          {/* 게시글 */}
          <Route path="/post/new" element={<PostForm user={user} />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/edit/:id" element={<EditPost />} />

          {/* 관리자 */}
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/posts" element={<AdminPage />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/stats" element={<AdminStats />} />

          {/* 회원가입/로그인 */}
          <Route path="/joinus" element={<Joinus />} />
          <Route path="/profile" element={<Profile />} />

          {/* 마이페이지 */}
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/editprofile" element={<EditProfile />} />

          {/* 캘린더 & 이벤트 */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/event-detail" element={<EventDetailPage />} />

          {/* 서울숲 추천 카페 */}
          <Route path="/seoulsup" element={<Seoulsup />} />
          <Route path="/cafe/:id" element={<CafeDetail />} />

          {/* 날씨 페이지 */}
          <Route path="/weather2" element={<Weather2 lat={lat} lon={lon} />} />

          {/* 지하철 */}
          <Route path="/subway" element={<SubwayMap />} />
          <Route path="/station/:name" element={<StationDetail />} />
        </Routes>
        {/* ✅ 모든 페이지에서 우측 하단 챗봇 */}
        <Contact isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
    </ThemeProvider>
  );
}

export default App;