import React, { useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/GlobalMap.css';
import { useNavigate } from 'react-router-dom';
import continentsGeo from '../data/continentsGeo.json';

/*
지도 배경(Tile Layer): OpenStreetMap 타일 서버를 사용
지도 위에 덧씌운 경계선: continentsGeo.json (대륙 GeoJSON 파일)
*/

/* ✅ 대륙 / 지역 단위
유형         | 예시
아시아       | 대한민국, 중국, 일본, 인도, 인도네시아, 베트남, 태국
유럽         | 프랑스, 독일, 이탈리아, 영국, 스페인, 네덜란드, 러시아
북아메리카   | 미국, 캐나다, 멕시코, 쿠바, 자메이카
남아메리카   | 브라질, 아르헨티나, 칠레, 콜롬비아, 페루
아프리카     | 나이지리아, 이집트, 남아프리카공화국, 케냐, 에티오피아, 가나
오세아니아   | 호주, 뉴질랜드, 피지, 파푸아뉴기니, 사모아
*/

const GlobalMap = () => {
  const mapRef = useRef();
  const navigate = useNavigate();

  const styleByContinent = {
    asia: { fillColor: "#f4a261" },
    europe: { fillColor: "#2a9d8f" },
    "north-america": { fillColor: "#e76f51" },
    "south-america": { fillColor: "#e63946" },
    africa: { fillColor: "#457b9d" },
    oceania: { fillColor: "#a29bfe" }
  };

  const continentNameKoMap = {
    Asia: '아시아',
    Europe: '유럽',
    Africa: '아프리카',
    'North America': '북아메리카',
    'South America': '남아메리카',
    Oceania: '오세아니아'
  };

  const onEachFeature = (feature, layer) => {
    const continentPath = feature.properties.path;
    const continentName = feature.properties.name;
    const continentNameKo = continentNameKoMap[continentName] || continentName;

    const fillColor =
      feature.properties.fillColor ||
      styleByContinent[continentPath]?.fillColor ||
      '#74c0fc';

    layer.bindTooltip(continentNameKo, {
      permanent: false,
      direction: 'top',
      className: 'region-tooltip',
    });

    layer.setStyle({
      weight: 1,
      color: '#555',
      fillColor: fillColor,
      fillOpacity: 0.6,
    });

    layer.on({
      mouseover: () => {
        layer.setStyle({
          weight: 2,
          color: '#333',
          fillColor: fillColor,
          fillOpacity: 0.85,
        });
        layer.openTooltip();
      },
      mouseout: () => {
        layer.setStyle({
          weight: 1,
          color: '#555',
          fillColor: fillColor,
          fillOpacity: 0.6,
        });
        layer.closeTooltip();
      },
      click: () => {
        navigate(`/map/global/detail?region=${continentNameKoMap[continentName]}`);
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={2}
        style={{
          height: '100vh',
          width: '100%',
          paddingTop: '60px', // 헤더 높이 대응
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeoJSON
          data={continentsGeo}
          onEachFeature={(feature, layer) => {
            console.log(`[${feature.properties.name}] geometry type:`, feature.geometry?.type);
            console.log(`[${feature.properties.name}] coordinates length:`, feature.geometry?.coordinates?.length);
            onEachFeature(feature, layer);
          }}
        />
      </MapContainer>
    </div>
  );
};

export default GlobalMap;
