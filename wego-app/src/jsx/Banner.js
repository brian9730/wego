import { useState, useEffect } from "react";
import { ArrowRightCircle } from 'react-bootstrap-icons';
// import 'animate.css';
import TrackVisibility from 'react-on-screen';
import bannerImage from '../images/photo-banner2.jpg'; // Seoul 이미지
import busanImage from '../images/busan-banner.jpg'; // Busan 이미지
import gyeongjuImage from '../images/kyeongju.jpg'; // Gyeongju 이미지
import jejuImage from '../images/jeju-banner.jpg'; // Jeju 이미지
import { useTheme } from '../context/ThemeContext';
import seouldark from '../images/seoul-dark.jpg'; // Seoul 이미지
import busandark from '../images/busan-dark.jpg'; // Busan 이미지
import gyeongjudark from '../images/gyeongju-dark.jpg'; // Gyeongju 이미지
import jejudark from '../images/jeju-dark.jpg'; // Jeju 이미지

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const [index, setIndex] = useState(1);
  const [currentCity, setCurrentCity] = useState("Seoul?");
  const toRotate = ["Seoul?", "Jeju?", "Busan?", "Gyeongju?"];
  const period = 2000;
  const [fade, setFade] = useState(false);
  const { darkMode } = useTheme();



  const imageMapLight = {
    "Seoul?": bannerImage,
    "Jeju?": jejuImage,
    "Busan?": busanImage,
    "Gyeongju?": gyeongjuImage
  };

  const imageMapDark = {
    "Seoul?": seouldark,
    "Jeju?": jejudark,
    "Busan?": busandark,
    "Gyeongju?": gyeongjudark
  };

  const currentImage = darkMode
    ? imageMapDark[currentCity] || imageMapDark["Seoul?"]
    : imageMapLight[currentCity] || imageMapLight["Seoul?"];


  useEffect(() => {
    const ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text]);

  useEffect(() => {
    if (!isDeleting && text === '') {
      setFade(true); // fade-out 시작

      const fadeTimeout = setTimeout(() => {
        const i = loopNum % toRotate.length;
        const fullText = toRotate[i];
        setCurrentCity(fullText); // 이미지 교체
        setFade(false); // fade-in 시작
      }, 500); // fade-out 시간과 맞춤

      return () => clearTimeout(fadeTimeout);
    }
  }, [text, isDeleting, loopNum]);

  const tick = () => {
    const i = loopNum % toRotate.length;
    const fullText = toRotate[i];

    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setIndex(prevIndex => prevIndex - 1);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setIndex(1);
      setDelta(500);
    } else {
      setIndex(prevIndex => prevIndex + 1);
    }
  };

  return (
    <section className="banner" id="home">
      <img
        src={currentImage}
        alt="배너 이미지"
        className={`banner-img ${fade ? 'fade-out' : ''}`}
      />

      <TrackVisibility>
        {({ isVisible }) => (
          <div className={isVisible ? "banner-content animate__animated animate__fadeIn" : "banner-content"}>
            <h1>
              <div className="headline-static">Do you want to go to</div>
              <div className="headline-dynamic">
                <span className="txt-rotate">
                  <span className="wrap">{text}</span>
                </span>
              </div>
            </h1>
            <p>
              늘 가던 곳 말고, 오늘은 조금 다른 길을 걸어보세요!<br />
              익숙한 일상 속에서도 새로운 장소는 분명히 존재하니까요<br />
              당신의 하루를 바꿔줄 특별한 장소, 지금 만나보세요!
            </p>
          </div>
        )}
      </TrackVisibility>
    </section>
  );
};