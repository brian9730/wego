import React from 'react';
import { useParams } from 'react-router-dom';

const cafes = [
  {
    name: '퍼먼트 서울숲점',
    desc: '맛있는 빵과 커피가 어우러진 공간',
    address: '서울특별시 성동구 서울숲길 28',
    phone: '010-3911-0072',
    website: 'https://map.naver.com/p/entry/place/1694234920?lng=127.0427013&lat=37.5466123&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202506101619&locale=ko&svcName=map_pcv5&fromPanelNum=1&additionalHeight=76&timestamp=202506101619&locale=ko&svcName=map_pcv5&entry=plt&searchType=place&c=15.00,0,0,0,dh',
    imgs: [
      require('../images/perment2.jpg'),
      require('../images/perment_alt2.jpg'),
      require('../images/perment_alt1.jpg'),
    ],
  },
  {
    name: '카멜커피 성수점',
    desc: '마음이 평온해지는 감성 카페',
    address: '서울 성동구 성덕정19길 6 1층',
    phone: '0507-1417-0492',
    website: 'https://map.naver.com/p/search/%EC%B9%B4%EB%A9%9C%EC%BB%A4%ED%94%BC%20%EC%84%B1%EC%88%98%20%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80/place/55585656?placePath=/home?entry=pll&from=map&fromPanelNum=2&timestamp=202506101625&locale=ko&svcName=map_pcv5&searchText=%EC%B9%B4%EB%A9%9C%EC%BB%A4%ED%94%BC%20%EC%84%B1%EC%88%98%20%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80&from=nx&fromPanelNum=2&timestamp=202506101625&locale=ko&svcName=map_pcv5&searchText=%EC%B9%B4%EB%A9%9C%EC%BB%A4%ED%94%BC%20%EC%84%B1%EC%88%98%20%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80&fromNxList=true&searchType=place&c=15.00,0,0,0,dh',
    imgs: [
      require('../images/camel.jpg'),
      require('../images/camel_alt1.jpg'),
      require('../images/camel_alt2.jpg'),
    ],
  },
  {
    name: 'LOWIDE',
    desc: '맛있는 빵과 다양한 디저트의 향연',
    address: '서울 성동구 서울숲2길 22-1',
    phone: '070-4910-2217',
    website: 'https://map.naver.com/p/search/LOWIDE/place/1687687205?placePath=/home?entry=pll&from=nx&fromNxList=true&fromPanelNum=2&timestamp=202506101627&locale=ko&svcName=map_pcv5&searchText=LOWIDE&searchType=place&c=15.00,0,0,0,dh',
    imgs: [
      require('../images/lowide.jpg'),
      require('../images/camel_alt1.jpg'),
      require('../images/camel_alt2.jpg'),
    ],
  },
  {
    name: '로우포레스트',
    desc: '진한 아메리카노와 넓은 정원의 조화',
    address: '서울 성동구 서울숲길 38 1층',
    phone: '02-2157-2155',
    website: 'https://map.naver.com/p/entry/place/1019405388?lng=127.0416995&lat=37.5479055&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202506101629&locale=ko&svcName=map_pcv5&fromPanelNum=1&additionalHeight=76&timestamp=202506101629&locale=ko&svcName=map_pcv5&searchType=place&c=15.00,0,0,0,dh',
    imgs: [
      require('../images/lowforest.jpg'),
      require('../images/camel_alt1.jpg'),
      require('../images/camel_alt2.jpg'),
    ],
  },
  {
    name: '라프레플루트 성수',
    desc: '신선한 과일로 만든 맛있는 케이크',
    address: '서울 성동구 서울숲2길 8-8 2층',
    phone: '0507-1383-7415',
    website: 'https://map.naver.com/p/entry/place/1966521856?lng=127.0394434&lat=37.5472525&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202506101630&locale=ko&svcName=map_pcv5&searchType=place',
    imgs: [
      require('../images/la.jpg'),
      require('../images/camel_alt1.jpg'),
      require('../images/camel_alt2.jpg'),
    ],
  }
];

const CafeDetail = () => {
  const { id } = useParams();
  const cafe = cafes[id];

  if (!cafe) {
    return <div>존재하지 않는 카페입니다.</div>;
  }

return (
 <div className="cafe-detail">
  <h1>{cafe.name}</h1>
  <p>{cafe.desc}</p>
  <p><strong>주소:</strong> {cafe.address}</p>
  <p><strong>전화번호:</strong> {cafe.phone}</p>
  <p>
    <strong></strong>{' '}
    <a
      href={cafe.website}
      target="_blank"
      rel="noopener noreferrer"
      className="cafe-website-link"
    >
      위치 및 상세정보
    </a>
  </p>
  <div className="cafe-detail-images">
    {cafe.imgs.map((imgSrc, idx) => (
      <img
        key={idx}
        src={imgSrc}
        alt={`${cafe.name} 이미지 ${idx + 1}`}
        className="cafe-image"
        draggable={false}
      />
    ))}
  </div>
</div>

);

};

export default CafeDetail;
