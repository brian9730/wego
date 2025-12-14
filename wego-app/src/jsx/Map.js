import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Map.css';
import koreaFlag from '../images/korea-flag.png';
import { motion } from "framer-motion";

const Map = () => {
  const navigate = useNavigate();

  return (
    <div className="map-page">
      <h2 className="map-title">어디로 여행할까요?</h2>
      <div className="map-buttons">
        <motion.button
          className="map-btn large"
          whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => navigate('/map/korea')}
        >
          <motion.img
            src={koreaFlag}
            alt="대한민국 국기"
            style={{ width: '40px', marginRight: '12px' }}
            animate={{
              rotate: [0, -10, 10, -10, 10, 0], // 왼쪽→오른쪽 흔들기
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
          국내 여행
        </motion.button>
          
        <motion.button
         className="map-btn large"
         whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
         whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
         onClick={() => navigate('/map/global')}
>       
         <motion.span
           style={{ fontSize: '40px', marginRight: '12px', display: 'inline-block' }}
           animate={{
             rotate: [0, -8, 8, -8, 8, 0],
           }}
           transition={{
             duration: 1,
             repeat: Infinity,
             repeatDelay: 3
           }}
         >
           🌍
         </motion.span>
         해외 여행
        </motion.button>
      </div>
    </div>
  );
};

export default Map;
