// wego-app/src/jsx/SubwayMap.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SubwayMap.css';

const LINES_ORDER = [
  '1호선','2호선','3호선','4호선','5호선','6호선','7호선','8호선','9호선',
  '경의·중앙선','경춘선','분당선','수인선','경강선','인천 1호선','인천 2호선',
  '인천국제공항철도','용인경전철','신분당선','의정부경전철',
];

const LINES_COLORS = {
  '1호선': '#0D3692',
  '2호선': '#33A23D',
  '3호선': '#FE5B10',
  '4호선': '#32A1C8',
  '5호선': '#8B50A4',
  '6호선': '#C55C1D',
  '7호선': '#54640D',
  '8호선': '#F51361',
  '9호선': '#AA9872',
  '경의·중앙선': '#73C7A6',
  '경춘선': '#32C6A6',
  '분당선': '#FFB300',
  '수인선': '#FFB300',
  '경강선': '#0065B3',
  '인천 1호선': '#8CADCB',
  '인천 2호선': '#F06A00',
  '인천국제공항철도': '#3681B7',
  '용인경전철': '#73C700',
  '신분당선': '#D4003B',
  '의정부경전철': '#FDA600',
};

// SVG 내부 data-line → 화면표시 라벨
const toDisplayLine = (raw) => {
  switch (raw) {
    case '경의중앙선':
    case '중앙선':
    case '경의선':
      return '경의·중앙선';
    case '인천1':
    case '인천1호선':
      return '인천 1호선';
    case '인천2_1':
    case '인천2호선':
      return '인천 2호선';
    case '공항철도':
    case '공항':
      return '인천국제공항철도';
    case '용인경':
    case '용인':
      return '용인경전철';
    case '의정부경':
    case '의정부':
      return '의정부경전철';
    default:
      return raw;
  }
};

// 화면표시 라벨 → 실제 SVG data-line 후보들
const DISPLAY_TO_SVG_LINES = {
    '1호선': ['1호선'],
    '2호선': ['2호선'],
    '3호선': ['3호선'],
    '4호선': ['4호선'],
    '5호선': ['5호선'],
    '6호선': ['6호선'],
    '7호선': ['7호선'],
    '8호선': ['8호선'],
    '9호선': ['9호선'],
    '경의·중앙선': ['중앙선'],
    '경춘선': ['경춘선'],
    '분당선': ['분당선'],
    '수인선': ['수인선'],
    '경강선': ['경강선'],
    '인천 1호선': ['인천1'],
    '인천 2호선': ['인천2_1'],
    '인천국제공항철도': ['공항철도'],
    '용인경전철': ['용인경'],
    '신분당선': ['신분당선'],
    '의정부경전철': ['의정부경'],
  };
  
const SubwayMap = () => {
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hoverHandlersRef = useRef([]);
  const navigate = useNavigate();

  const [scale, setScale] = useState(1);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  const [searchOpen, setSearchOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [stationList, setStationList] = useState([]);
  const [activeStation, setActiveStation] = useState(null);

  // ✅ 최신 stationList를 참조할 ref
  const stationListRef = useRef([]);

  // ✅ stationList가 바뀔 때마다 ref 갱신
  useEffect(() => {
    stationListRef.current = stationList;
  }, [stationList]);

  // 배경 클릭 시 팝업 닫기
  useEffect(() => {
    const handleClose = (e) => {
      if (e.target.closest('.station-popup')) return;
      if (e.target.tagName === 'text' || e.target.tagName === 'tspan') return;
      setActiveStation(null);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);
  
  // SVG 로드 + 초기 중앙 스크롤
  useEffect(() => {
    let aborted = false;
    fetch('/Subway.svg')
      .then((res) => res.text())
      .then((svgText) => {
        if (aborted) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svgText;
          wireHoverEvents();
          setTimeout(() => !aborted && collectStationsFromSVG(), 600);
        }
        const sc = scrollContainerRef.current;
        if (sc) {
          sc.scrollTo({
            left: sc.scrollWidth / 2 - sc.clientWidth / 2,
            top: sc.scrollHeight / 2 - sc.clientHeight / 2,
          });
        }
      });
    return () => {
      aborted = true;
      cleanupHover();
    };
  }, []);

  // hover / 선택 반영
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    const all = svg.querySelectorAll('[data-line]');
    all.forEach((el) => el.classList.remove('active', 'dimmed'));
    if (selectedLines.length > 0 || hoveredLine) {
      all.forEach((el) => el.classList.add('dimmed'));
    }
    const activate = (lineName) => {
      const targets = DISPLAY_TO_SVG_LINES[lineName] || [lineName];
      all.forEach((el) => {
        const v = el.getAttribute('data-line') || '';
        if (targets.includes(v)) {
          el.classList.add('active');
          el.classList.remove('dimmed');
        }
      });
    };
    selectedLines.forEach(activate);
    if (hoveredLine) activate(hoveredLine);
  }, [hoveredLine, selectedLines]);

  // 드래그 이동
  useEffect(() => {
    const sc = scrollContainerRef.current;
    if (!sc) return;
    let startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0;
    const onDown = (e) => {
      isDraggingRef.current = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = sc.scrollLeft;
      scrollTop = sc.scrollTop;
      sc.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      sc.scrollLeft = scrollLeft - (e.clientX - startX);
      sc.scrollTop = scrollTop - (e.clientY - startY);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      sc.style.cursor = 'grab';
    };
    sc.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      sc.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // 확대/축소 (Ctrl+휠)
  useEffect(() => {
    const sc = scrollContainerRef.current;
    if (!sc) return;
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale((prev) =>
        Math.min(Math.max(e.deltaY < 0 ? prev * 1.1 : prev * 0.9, 0.5), 3)
      );
    };
    sc.addEventListener('wheel', onWheel, { passive: false });
    return () => sc.removeEventListener('wheel', onWheel);
  }, []);

  // hover 연결
  const wireHoverEvents = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    cleanupHover();
    svg.querySelectorAll('[data-line]').forEach((el) => {
      const line = el.getAttribute('data-line');
      if (!line) return;
      const enter = () => !isDraggingRef.current && setHoveredLine(toDisplayLine(line));
      const leave = () =>
        setHoveredLine((cur) => (cur === toDisplayLine(line) ? null : cur));
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      hoverHandlersRef.current.push({ el, enter, leave });
    });
  };
  const cleanupHover = () => {
    hoverHandlersRef.current.forEach(({ el, enter, leave }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
    hoverHandlersRef.current = [];
  };

  // 노선 토글 + 중앙 이동
  const toggleLine = (lineName) => {
    setSelectedLines((prev) =>
      prev.includes(lineName) ? prev.filter((l) => l !== lineName) : [...prev, lineName]
    );

    const svg = containerRef.current?.querySelector('svg');
    const sc = scrollContainerRef.current;
    if (!svg || !sc) return;

    const targets = DISPLAY_TO_SVG_LINES[lineName] || [lineName];
    const targetEl = Array.from(svg.querySelectorAll('[data-line]')).find(el => targets.includes(el.getAttribute('data-line')));
    
    if (targetEl) {
        const rect = targetEl.getBBox();
        const scRect = sc.getBoundingClientRect();
        const targetX = (rect.x + rect.width / 2) * scale;
        const targetY = (rect.y + rect.height / 2) * scale;
        sc.scrollTo({
            left: targetX - scRect.width / 2,
            top: targetY - scRect.height / 2,
            behavior: 'smooth',
        });
    }
  };
  
// ✅ 교체할 collectStationsFromSVG 전체
const collectStationsFromSVG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
  
    const found = [];
    const linePaths = Array.from(svg.querySelectorAll('path[data-line], polyline[data-line]'));
  
    svg.querySelectorAll('text').forEach((node) => {
      if (node.closest('g[id*="legend"]')) return;
  
      const name = node.textContent?.trim().replace(/\s+/g, ' ');
      if (!name || name.length < 2) return;
  
      // 좌표 추출
      let x, y;
      const transform = node.getAttribute('transform');
      if (transform?.includes('matrix')) {
        const parts = transform.match(/matrix\(([^)]+)\)/)[1].split(/[ ,]+/);
        x = parseFloat(parts[4]);
        y = parseFloat(parts[5]);
      } else {
        const box = node.getBBox();
        x = box.x + box.width / 2;
        y = box.y + box.height / 2 + 25; // ✅ 노선선 근처로 좌표 보정
      }
      if (isNaN(x) || isNaN(y)) return;
  
      // 노선 추적
      const lines = new Set();
      let parent = node.parentElement;
      while (parent && parent !== svg) {
        const ln = parent.getAttribute('data-line');
        if (ln) lines.add(toDisplayLine(ln));
        parent = parent.parentElement;
      }
  
      // 근접 탐색
      const PROXIMITY_RADIUS = 80; // ✅ 탐색 반경 확대
      linePaths.forEach((path) => {
        try {
          const pathLength = path.getTotalLength();
          if (pathLength === 0) return;
          const step = pathLength / 50;
          for (let i = 0; i < pathLength; i += step) {
            const pt = path.getPointAtLength(i);
            if (Math.hypot(x - pt.x, y - pt.y) < PROXIMITY_RADIUS) {
              lines.add(toDisplayLine(path.getAttribute('data-line')));
              break;
            }
          }
        } catch (e) {}
      });
  
      node.style.cursor = 'pointer';
      node.style.userSelect = 'none';
      found.push({ name, lines: Array.from(lines), node, x, y });
    });
  
    const merged = Object.values(
      found.reduce((acc, s) => {
        if (!acc[s.name]) {
          acc[s.name] = { ...s, lines: new Set(s.lines) };
        } else {
          s.lines.forEach((line) => acc[s.name].lines.add(line));
        }
        return acc;
      }, {})
    ).map((s) => ({
      ...s,
      lines: Array.from(s.lines).filter((l) => LINES_COLORS[l]),
    }));
  
    merged.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    setStationList(merged);
  
    // ✅ 텍스트 클릭 이벤트
    merged.forEach((st) => {
      const newNode = st.node.cloneNode(true);
      st.node.parentNode.replaceChild(newNode, st.node);
      st.node = newNode;
      st.node.addEventListener('click', (e) => {
        e.stopPropagation();
        showPopupAtStation(st);
      });
    });
  
    // ✅ 마커 생성 (역마다 circle)
    merged.forEach((st) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', st.x - 10);
      circle.setAttribute('cy', st.y + 3);
      circle.setAttribute('r', '7');
      circle.setAttribute('fill', '#fff');
      circle.setAttribute('stroke', LINES_COLORS[st.lines[0]] || '#333');
      circle.setAttribute('stroke-width', '2');
      circle.classList.add('station-node');
  
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
      
        // ✅ 항상 최신 stationList를 참조
        const latestList = stationListRef.current || [];
        const latest = latestList.find((s) => s.name === st.name);
      
        showPopupAtStation(latest || st);
      });      
      st.node.parentNode.appendChild(circle);
    });
  
    console.log(`✅ 수집된 역 수: ${merged.length}, 마커 생성 완료`);

    // ✅ JSON 파일로 lines 보정
    fetch('/stations_v2.json')
  .then(res => res.json())
  .then((jsonData) => {
    const corrected = merged.map(st => {
      const match = jsonData.find(j => j.name === st.name);
      if (match && match.lines && match.lines.length > 0) {
        return { ...st, lines: match.lines };
      }
      return st;
    });
    setStationList(corrected);

    // ✅ JSON 보정 후 클릭 이벤트 재등록
    corrected.forEach((st) => {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) return;
      const node = Array.from(svg.querySelectorAll('text'))
        .find((t) => t.textContent.trim() === st.name);
      if (node) {
        const circle = node.parentNode.querySelector('circle');
        if (circle) {
          circle.onclick = (e) => {
            e.stopPropagation();
            showPopupAtStation(st);
          };
        }
      }
    });

    console.log(`🧩 JSON 기반 노선정보 보정 및 이벤트 갱신 완료 (${corrected.length}개 역)`);
  })
  .catch(err => {
    console.error("❌ stations_v2.json 로드 실패:", err);
    setStationList(merged);
  });
};
  
const showPopupAtStation = (station) => {
    const sc = scrollContainerRef.current;
    if (!sc || isNaN(station.x) || isNaN(station.y)) return;
  
    // ✅ JSON 보정 후 stationList에서 최신 데이터로 갱신
    const matched = stationList.find((s) => s.name === station.name);
    const fixedStation = matched ? matched : station;
  
    setActiveStation(fixedStation);
  
    sc.scrollTo({
      left: fixedStation.x * scale - sc.clientWidth / 2,
      top: fixedStation.y * scale - sc.clientHeight / 2,
      behavior: 'smooth',
    });
  };
  
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };
  const filteredStations = query.trim()
    ? stationList.filter((s) => s.name.includes(query.trim()))
    : [];
  const handleSelectStation = (station) => {
    setSearchOpen(false);
    setQuery('');
    setTimeout(() => showPopupAtStation(station), 150);
  };

const badgeText = (displayNameRaw) => {
  console.log("🔍 badgeText input:", displayNameRaw); // 확인용

  const displayName = displayNameRaw.trim();

  // ✅ 숫자 노선 (1호선~9호선)
  if (/^\d+호선$/.test(displayName)) return displayName.replace("호선", "");

  // ✅ 실제 SVG / JSON 기반 raw 이름 매핑
  const custom = {
    // 복합 노선
    "중앙선": "중", // 경의·중앙선
    "경의·중앙선": "중",
    "경의중앙선": "중",

    // 수도권 외곽 노선
    "경춘선": "춘",
    "분당선": "분",
    "수인선": "수",
    "경강선": "강",
    "경강": "강",

    // 인천 라인
    "인천1": "인1",
    "인천1호선": "인1",
    "인천 1호선": "인1",
    "인천2_1": "인2",
    "인천2호선": "인2",
    "인천 2호선": "인2",

    // 공항, 경전철류
    "공항철도": "공",
    "인천국제공항철도": "공",
    "의정부경": "의",
    "의정부경전철": "의",
    "용인경전철": "용",
    "신분당": "신",
    "신분당선": "신",
  };

  if (custom[displayName]) return custom[displayName];

  // 기본값
  return displayName.replace(/선$/, "");
};

  return (
    <div className="subway-map">
      <div className="svg-scroll-container" ref={scrollContainerRef}>
        <div
          ref={containerRef}
          className="svg-map"
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
        />

        {activeStation && (
          <div
            className="station-popup"
            style={{
              position: 'absolute',
              left: `${activeStation.x * scale}px`,
              top: `${activeStation.y * scale}px`,
            }}
          >
            <div className="popup-title">{activeStation.name}</div>
            <div className="popup-lines">
              {activeStation.lines.map((display) => (
                <span
                  key={display}
                  className="popup-line-circle"
                  style={{ background: LINES_COLORS[display] || '#999' }}
                >
                  {badgeText(display)}
                </span>
              ))}
            </div>
            <button
              className="popup-btn"
              onClick={() => navigate(`/station/${encodeURIComponent(activeStation.name)}`)}
            >
              보러가기
            </button>       
          </div>
        )}

      </div>

      <div className="map-legend">
        {LINES_ORDER.map((line) => (
          <button
            key={line}
            onMouseEnter={() => setHoveredLine(line)}
            onMouseLeave={() => setHoveredLine(null)}
            onClick={() => toggleLine(line)}
            className={`legend-item ${selectedLines.includes(line) ? 'selected' : ''}`}
            style={{
              borderColor: LINES_COLORS[line],
              color: selectedLines.includes(line) ? '#fff' : LINES_COLORS[line],
              background: selectedLines.includes(line) ? LINES_COLORS[line] : 'transparent',
            }}
          >
            {line}
          </button>
        ))}
      </div>

      <div className="wego-fab">
        <button
          type="button"
          className="fab-main"
          onClick={(e) => {
            e.stopPropagation();
            setSearchOpen(true);
            setQuery('');
          }}
          title="역 검색"
        >
          🔍
        </button>
      </div>

      {searchOpen && (
        <>
          <div className="wego-overlay" onClick={closeSearch} />
          <div className="wego-search-modal">
            <div className="search-title">역 검색</div>
            <input
              autoFocus
              className="search-input"
              type="text"
              placeholder="역 이름을 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="search-list">
              {filteredStations.length === 0 && query.trim().length > 0 && (
                <li className="empty">검색 결과가 없어요</li>
              )}
              {filteredStations.map((s) => (
                <li key={s.name} onClick={() => handleSelectStation(s)}>
                  <div className="search-station-item">
                    <span className="station-name">{s.name}</span>
                    <span className="station-lines">
                      {s.lines.map((display) => (
                        <span
                          key={display}
                          className="popup-line-circle"
                          style={{ background: LINES_COLORS[display] || '#999' }}
                        >
                          {badgeText(display)}
                        </span>
                      ))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <button className="search-close" onClick={closeSearch}>닫기</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubwayMap;