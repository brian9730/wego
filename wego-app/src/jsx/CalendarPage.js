import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../css/Calendar.css';

export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [offset, setOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  const getStartOfWeek = (baseDate) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  };

  const getWeekDates = (offset) => {
    const start = getStartOfWeek(new Date());
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(offset);
  const navigate = useNavigate();

  const handleCardClick = (contentid) => {
    navigate('/event-detail', { state: { contentid } });
  };

  // ✅ 이벤트 가져오기 (백엔드 프록시 사용)
  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = selectedDate.toISOString().slice(0, 10).replace(/-/g, '');

      try {
        const response = await fetch(
          `http://localhost:5000/api/festival?startDate=${formattedDate}`
        );
        const data = await response.json();
        const items = data.response?.body?.items?.item || [];

        const filteredEvents = items
          .filter(item => {
            if (searchQuery === "") return true;
            return (
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.addr1 && item.addr1.toLowerCase().includes(searchQuery.toLowerCase()))
            );
          })
          .map(item => ({
            title: item.title,
            description: item.addr1 || '',
            image: item.firstimage || 'https://via.placeholder.com/150',
            startDate: item.eventstartdate,
            endDate: item.eventenddate,
            contentid: item.contentid
          }));

        setEvents(filteredEvents);
        setVisibleCount(4);
      } catch (error) {
        console.error("API fetch error:", error);
        setEvents([]);
      }
    };

    fetchData();
  }, [selectedDate, searchQuery]);

  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="calendar-page">
      <h2>📅 {formatDate(selectedDate)}</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="date-header-container">
        <button onClick={() => setOffset(offset - 1)} className="arrow-btn">◀</button>
        <div className="date-list">
          {weekDates.map((date, idx) => {
            const isSelected = selectedDate.toDateString() === date.toDateString();
            return (
              <div
                key={idx}
                className={`date-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day">{date.toLocaleDateString('ko-KR', { weekday: 'short' })}</div>
                <div className="num">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setOffset(offset + 1)} className="arrow-btn">▶</button>
      </div>

      <div className="event-list">
        {events.length > 0 ? (
          events.slice(0, visibleCount).map((event, idx) => (
            <div
              key={idx}
              className="event-card"
              onClick={() => handleCardClick(event.contentid)}
              style={{ cursor: 'pointer' }}
            >
              <img src={event.image} alt={event.title} />
              <div className="event-info">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>{event.startDate} ~ {event.endDate || event.startDate}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">📭 해당 날짜에 예정된 행사가 없습니다.</p>
        )}
      </div>

      <button onClick={() => setVisibleCount(prev => prev + 4)} className="more-btn">
        더보기
      </button>

      <Link to="/" className="back-btn">뒤로가기</Link>
    </div>
  );
};
