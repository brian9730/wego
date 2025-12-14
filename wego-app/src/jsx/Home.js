import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRightCircle } from 'react-bootstrap-icons';
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import 'react-multi-carousel/lib/styles.css';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';

// 이미지 import
import perment from './images/perment.jpg';
import jj from './images/jj.jpg';
import pieces from './images/pieces.jpg';
import ssl from './images/ssl.jpg';
import adv1 from './images/adv1.jpg';
import adv2 from './images/adv2.jpg';
import adv3 from './images/adv3.jpg';

// ===================================================
// Banner 컴포넌트
// ===================================================
const Banner = () => {
    const [loopNum, setLoopNum] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [text, setText] = useState('');
    const [delta, setDelta] = useState(300 - Math.random() * 100);
    const [index, setIndex] = useState(1);
    const toRotate = ["Seoul?", "Paris?", "Busan?"];
    const period = 2000;

    useEffect(() => {
        let ticker = setInterval(() => {
            tick();
        }, delta);

        return () => { clearInterval(ticker) };
    }, [text])

    const tick = () => {
        let i = loopNum % toRotate.length;
        let fullText = toRotate[i];
        let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

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
    }

    return (
        <section className="banner" id="home">
            <Container>
                <Row className="aligh-items-center">
                    <Col xs={12} md={6} xl={7}>
                        <TrackVisibility>
                            {({ isVisible }) =>
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h1>{`Do you want to go to`} <span className="txt-rotate" dataPeriod="1000" data-rotate='[ "Seoul?", "Paris?", "Busan?" ]'><span className="wrap">{text}</span></span></h1>
                                    <p> 늘 가던 곳 말고, 오늘은 조금 다른 길을 걸어보세요!<br></br>
                                        익숙한 일상 속에서도 새로운 장소는 분명히 존재하니까요<br></br>
                                        당신의 하루를 바꿔줄 특별한 장소, 지금 만나보세요! </p>
                                    <button onClick={() => console.log('connect')}>Let's go <ArrowRightCircle size={25} /></button>
                                </div>}
                        </TrackVisibility>
                    </Col>
                    <Col xs={12} md={6} xl={5}>
                        <TrackVisibility>
                            {({ isVisible }) =>
                                <div className={isVisible ? "animate__animated animate__zoomIn" : ""}>
                                </div>}
                        </TrackVisibility>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

// ===================================================
// Skills 컴포넌트
// ===================================================
const Skills = () => {
    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    return (
        <section className="skill" id="skills">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="skill-bx wow zoomIn">
                            <h2>오늘, 커피 한 잔 어때요?</h2>
                            <p>바쁜 일상 속, 잠시 쉬어가고 싶은 순간이 있나요?<br></br> 숨겨진 골목에서 만나는 따뜻함, 향긋한 커피향☕</p>
                            <Carousel responsive={responsive} infinite={true} className="owl-carousel owl-theme skill-slider">
                                <Link to="/seoulsup">
                                    <div className="item">
                                        <div className="overlay-container">
                                            <img src={perment} alt="Image" />
                                            <div className="overlay">
                                                <h6>'서울숲' 데이트 장소 <br />카페 모음집</h6>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <Link to="/jsx/gyeongju">
                                    <div className="item">
                                        <div className="overlay-container">
                                            <img src={jj} alt="Image" />
                                            <div className="overlay">
                                                <h6>경주여행에 필요한 <br />카페 지도 5곳</h6>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <Link to="/jsx/yeonhui">
                                    <div className="item">
                                        <div className="overlay-container">
                                            <img src={pieces} alt="Image" />
                                            <div className="overlay">
                                                <h6>연희동에서 보내는 하루<br />(카페 편)</h6>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <Link to="/jsx/eunpyeong">
                                    <div className="item">
                                        <div className="overlay-container">
                                            <img src={ssl} alt="Image" />
                                            <div className="overlay">
                                                <h6>언제가도 좋은<br />은평구 카페 5곳</h6>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ===================================================
// Adv 컴포넌트
// ===================================================
const Adv = () => {
    const [currentAd, setCurrentAd] = useState(0);

    const ads = [
        {
            image: adv1,
            title: '금호미술관: 금호 아티스트',
            subtitle: '지금 전시 10% 할인받고 예매하기',
        },
        {
            image: adv2,
            title: '에꼴 드 퍼퓨머리문 한남',
            subtitle: '지금 프리미엄 향수 클래스 예매하기',
        },
        {
            image: adv3,
            title: '한국의집 궁중 다과 체험',
            subtitle: '지금 바로 선착순 예매하기',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            nextAd();
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const nextAd = () => {
        setCurrentAd((prev) => (prev + 1) % ads.length);
    };

    const prevAd = () => {
        setCurrentAd((prev) => (prev - 1 + ads.length) % ads.length);
    };

    return (
        <div className="adv-banner">
            <button className="adv-arrow left" onClick={prevAd}>‹</button>
            <div className="adv-content">
                <img src={ads[currentAd].image} alt="광고 이미지" className="adv-img" />
                <div className="adv-text">
                    <h3 className="adv-title">{ads[currentAd].title}</h3>
                    <p className="adv-subtitle">{ads[currentAd].subtitle}</p>
                </div>
            </div>
            <button className="adv-arrow right" onClick={nextAd}>›</button>
        </div>
    );
};

// ===================================================
// Projects 컴포넌트
// ===================================================
const Projects = () => {
    const [weeklyProjects, setWeeklyProjects] = useState({
        sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
    });
    const [loading, setLoading] = useState(true);

    const dayTabs = [
        { key: 'sun', label: '일' },
        { key: 'mon', label: '월' },
        { key: 'tue', label: '화' },
        { key: 'wed', label: '수' },
        { key: 'thu', label: '목' },
        { key: 'fri', label: '금' },
        { key: 'sat', label: '토' },
    ];

    const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    const [activeKey, setActiveKey] = useState(todayKey);

    const getThisWeeksDateByDayKey = (dayKey) => {
        const today = new Date();
        const currentDay = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - currentDay);

        const dayIndexMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const targetIndex = dayIndexMap[dayKey];

        const targetDate = new Date(weekStart);
        targetDate.setDate(weekStart.getDate() + targetIndex);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate;
    };

    useEffect(() => {
        const fetchFestivalData = async () => {
            setLoading(true);
            try {
                const apiKey = 'KXWwko5%2FUXOIyDX88ddpKWY7%2B8UDIopraGlBkm738JD%2Fs%2BggElLNDojqAVckELa8CGY8eTEEc5OMzsuzJ344Zw%3D%3D';
                const today = new Date();
                const startDate = today.toISOString().slice(0, 10).replace(/-/g, '');

                const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${apiKey}&MobileOS=ETC&MobileApp=MyTravelApp&eventStartDate=${startDate}&_type=json&numOfRows=100`;

                const response = await fetch(url);
                const rawText = await response.text();
                console.log(rawText);

                const data = JSON.parse(rawText);
                const items = data.response?.body?.items?.item || [];

                const projectsByDay = {
                    sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
                };

                const formatDate = (dateStr) => {
                    return new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`);
                };

                items.forEach((event) => {
                    const rawStartDate = event.eventstartdate;
                    const rawEndDate = event.eventenddate;
                    if (!rawStartDate) return;

                    const eventStartDate = formatDate(rawStartDate);
                    const eventEndDate = rawEndDate ? formatDate(rawEndDate) : eventStartDate;
                    eventStartDate.setHours(0, 0, 0, 0);
                    eventEndDate.setHours(0, 0, 0, 0);

                    dayTabs.forEach(({ key }) => {
                        const targetDate = getThisWeeksDateByDayKey(key);
                        if (targetDate >= eventStartDate && targetDate <= eventEndDate) {
                            projectsByDay[key].push({
                                title: event.title,
                                description: event.addr1 || '',
                                eventStartDate: eventStartDate.toISOString(),
                                eventEndDate: eventEndDate.toISOString(),
                                imgUrl: event.firstimage || 'https://via.placeholder.com/150',
                            });
                        }
                    });
                });

                setWeeklyProjects(projectsByDay);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFestivalData();
    }, []);

    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.toLocaleDateString()} ~ ${end.toLocaleDateString()}`;
    };

    return (
        <section className="project" id="projects">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2>요일별 전시 · 행사 일정</h2>
                                    <p>이번 주, 어떤 전시가 열리는지 확인해보세요!</p>
                                    <div className="day-circle-tabs">
                                        {dayTabs.map(({ key, label }) => {
                                            const isToday = key === todayKey;
                                            return (
                                                <div key={key} className="day-circle-btn-container">
                                                    <button
                                                        className={`day-circle-btn ${activeKey === key ? 'active' : ''} ${isToday ? 'today' : ''}`}
                                                        onClick={() => setActiveKey(key)}
                                                    >
                                                        {label}
                                                    </button>
                                                    {isToday && <span className="today-indicator"></span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="vertical-card-list">
                                        {loading ? (
                                            <div>Loading...</div>
                                        ) : (
                                            weeklyProjects[activeKey].length > 0 ? (
                                                <>
                                                    {weeklyProjects[activeKey].slice(0, 4).map((project, index) => (
                                                        <div key={index} className="vertical-card">
                                                            <div className="card-text">
                                                                <span className="card-type">전시</span>
                                                                <h4>{project.title}</h4>
                                                                <p>{project.description}</p>
                                                                <p>{formatDateRange(project.eventStartDate, project.eventEndDate)}</p>
                                                            </div>
                                                            <img
                                                                src={project.imgUrl}
                                                                alt={project.title}
                                                                className="card-image"
                                                            />
                                                        </div>
                                                    ))}
                                                    {weeklyProjects[activeKey].length > 4 && (
                                                        <Link to="/calendar" className="more-btn">더보기</Link>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="empty-message">📭 이 날은 예정된 일정이 없습니다.</div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </TrackVisibility>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

// ===================================================
// 최종 Main 컴포넌트
// ===================================================
export const Home = () => {
    return (
        <>
            <Banner />
            <Skills />
            <Adv />
            <Projects />
        </>
    );
};