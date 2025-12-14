// ✅ 통합 NavBar.js (기존 로그인 상태 확인 + 사이드메뉴/다크모드/FAQ)
import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import logo from '../images/logo.svg';
import navIcon1 from '../images/nav-icon1.svg';
import navIcon2 from '../images/nav-icon2.svg';
import navIcon3 from '../images/nav-icon3.svg';
import { HashLink } from 'react-router-hash-link';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import FAQModal from './FAQModal';
import logoLight from '../images/logo.svg.png';
import logoDark from '../images/logo-dark.svg.png';

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  let lastScrollY = window.scrollY;



  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 방향 감지
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false); // 아래로 스크롤 → NavBar 숨김
      } else {
        setShowNavbar(true); // 위로 스크롤 → NavBar 보임
      }

      lastScrollY = currentScrollY;

      // 배경색용 scrolled 상태도 유지
      setScrolled(currentScrollY > 50);
    };

    // 로그인 상태 확인
    const checkLogin = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    checkLogin(); // 초기 실행
    const interval = setInterval(checkLogin, 1000); // 1초마다 로그인 상태 확인

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const onUpdateActiveLink = (value) => setActiveLink(value);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleFA = () => {
    setShowFAQModal(true);
    toggleMenu();
  };

  {/* [0610] 로그아웃 시 로그인페이지로 이동 & 알럿창 */ }
  const handleLogout = () => {
    const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?');
    if (!confirmLogout) return;

    localStorage.removeItem('user');
    setUser(null);
    navigate('/joinus');
  };
  const currentLogo = document.body.classList.contains('light') ? logoDark : logoLight;
  return (
    <>
      <Navbar expand="md" className={`navbar ${scrolled ? 'scrolled' : ''} ${showNavbar ? 'visible' : 'hidden'}`}>
        <Container>
          <Navbar.Brand href="/">
            <img src={currentLogo} alt="Logo" />
          </Navbar.Brand>

          <Nav className="ms-auto header__center">
            <Nav.Link href="#home" className={activeLink === 'home' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('home')}>Home</Nav.Link>
            <Nav.Link href="#skills" className={activeLink === 'skills' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('skills')}>Today</Nav.Link>
            <Nav.Link href="#projects" className={activeLink === 'projects' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('projects')}>Exhibition</Nav.Link>
          </Nav>

          <span className="navbar-text header__right">
            <div className="social-icon">
              <a href="#"><img src={navIcon1} alt="" /></a>
              <a href="#"><img src={navIcon2} alt="" /></a>
              <a href="#"><img src={navIcon3} alt="" /></a>
            </div>

            {/* 0513 수정 */}
            {/* 0520 추가 수정 */}

            {user ? (
              <>
                <button
                  className="vvd"
                  onClick={() => {
                    if (user.is_admin) {
                      navigate('/admin');
                    } else {
                      navigate('/mypage')
                    }

                  }}
                >
                  <span>👤 {user.name}</span>
                </button>
              </>
            ) : (
              <Link to="/joinus">
                <button className="vvd"><span>Let’s Connect</span></button>
              </Link>
            )}

            {/* 햄버거 메뉴 열기 버튼 */}
            <div className="hamburger-menu" onClick={toggleMenu}>
              <FiMenu size={32} />
            </div>
          </span>
        </Container>
      </Navbar>

      {/* 오버레이 (검은 배경) */}
      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      {/* 사이드 메뉴 */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="close-icon" onClick={toggleMenu}>
          <FiX size={32} />
        </div>
        <ul className="side-menu__list">
          <Link to="/about" onClick={toggleMenu}><li className="side-menu__item">About</li></Link>
          <li className="side-menu__item" onClick={handleFA}>F&A</li>
          <Link to="/setting" onClick={toggleMenu}><li className="side-menu__item">Setting</li></Link>
          {/* <Link to="/map" onClick={toggleMenu}><li className="side-menu__item">Map</li></Link> */}
        </ul>

        {/* [0610] 로그아웃 버튼 이동 */}
        {user && (
          <div className="side-menu__logout" onClick={() => {
            handleLogout();
            toggleMenu();
          }}>
            로그아웃
          </div>
        )}
      </div>

      {/* FAQ 모달 */}
      {showFAQModal && <FAQModal onClose={() => setShowFAQModal(false)} />}
    </>
  );
};

export default NavBar;
