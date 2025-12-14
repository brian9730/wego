const fs = require('fs');

// 원본 파일 로드
const data = JSON.parse(fs.readFileSync('./ne_50m_admin_0_countries.json'));

// 대륙별 데이터 그룹핑
const grouped = {
  Asia: [],
  Europe: [],
  'North America': [],
  'South America': [],
  Africa: [],
  Oceania: []
};

data.features.forEach(feature => {
  const continent = feature.properties.CONTINENT;
  if (grouped[continent]) {
    grouped[continent].push(feature);
  }
});

// 통합된 FeatureCollection 생성
const continentsGeo = {
  type: 'FeatureCollection',
  features: Object.keys(grouped).map(continent => ({
    type: 'Feature',
    properties: {
      name: continent,
      path: continent.toLowerCase().replace(' ', '-')
    },
    geometry: {
      type: 'MultiPolygon',
      coordinates: grouped[continent].flatMap(f => f.geometry.coordinates)
    }
  }))
};

// 결과 저장
fs.writeFileSync('./continentsGeo.json', JSON.stringify(continentsGeo, null, 2));
console.log('continentsGeo.json 생성 완료!');
