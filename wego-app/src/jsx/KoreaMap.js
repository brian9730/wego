import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import koreaGeo from '../data/koreaGeo.json';
import 'leaflet/dist/leaflet.css';
import '../css/KoreaMap.css';
import { useNavigate } from 'react-router-dom';

/*
지도 배경(Tile Layer): OpenStreetMap 타일 서버를 사용 -> 정적 api
지도 위에 덧씌운 경계선: koreaGeo.json 파일 (GeoJSON 파일)을 사용
*/

/* ✅ 시 / 도 / 특별자치시 / 특별자치도 단위
유형	| 예시
특별시	| 서울특별시
광역시	| 부산광역시, 대구광역시, 인천광역시, 광주광역시, 대전광역시, 울산광역시
특별자치시	| 세종특별자치시
도	경기도, 강원도, 충청북도, 충청남도, 전라북도, 전라남도, 경상북도, 경상남도
특별자치도	| 제주특별자치도
*/

const nameMap = {
  Seoul: '서울특별시',
  Busan: '부산광역시',
  Daegu: '대구광역시',
  Incheon: '인천광역시',
  Gwangju: '광주광역시',
  Daejeon: '대전광역시',
  Ulsan: '울산광역시',
  Sejong: '세종특별자치시',
  Gyeonggi: '경기도',
  Gangwon: '강원도',
  Chungbuk: '충청북도',
  Chungnam: '충청남도',
  Jeonbuk: '전라북도',
  Jeonnam: '전라남도',
  Gyeongbuk: '경상북도',
  Gyeongnam: '경상남도',
  Jeju: '제주특별자치도',

  // ⬇️ 영어 전체 표기까지 대응
  'North Chungcheong': '충청북도',
  'South Chungcheong': '충청남도',
  'North Gyeongsang': '경상북도',
  'South Gyeongsang': '경상남도',
  'North Jeolla': '전라북도',
  'South Jeolla': '전라남도',
};

const KoreaMap = () => {
  const [activeLayer, setActiveLayer] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef();

  const highlightStyle = {
    weight: 2,
    color: '#333',
    fillColor: '#4dabf7',
    fillOpacity: 0.8,
  };

  const resetStyle = {
    weight: 1,
    color: '#666',
    fillColor: '#74c0fc',
    fillOpacity: 0.5,
  };

  const onEachFeature = (feature, layer) => {
    
    const englishName = feature.properties.name;
    const regionName = nameMap[englishName] || englishName;
    
    layer.bindTooltip(regionName, {
      permanent: false,
      direction: 'top',
      className: 'region-tooltip',
    });

    layer.on({
      mouseover: (e) => {
        if (activeLayer !== layer) {
          layer.setStyle(highlightStyle);
        }
        layer.openTooltip();
      },
      mouseout: (e) => {
        if (activeLayer !== layer) {
          layer.setStyle(resetStyle);
        }
        layer.closeTooltip();
      },
      click: () => {
        setActiveLayer(layer);
        navigate(`/map/korea/detail2?region=${regionName}`);
      },
    });

    // 초기 스타일 설정
    layer.setStyle(resetStyle);
  };

  return (
    <div style={{
      minHeight: '100vh',   // 페이지 전체 높이
      overflow: 'hidden'    // 스크롤 방지 
    }}>
      <MapContainer
        ref={mapRef}
        center={[36.5, 127.8]}
        zoom={7}
        style={{
          height: '100vh',
          width: '100%',
          paddingTop: '60px'  // ✅ 헤더 공간 확보
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON data={koreaGeo} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );  
};

export default KoreaMap;
