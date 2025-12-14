
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 진입 시 브라우저 스크롤 복원 방지
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // DOM이 렌더링된 후 스크롤 이동
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
