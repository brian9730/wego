import React, { useEffect, useState } from 'react';
import './styles/SubwayMap.css';

const CursorOverlay = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const move = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div
            className="cursor-overlay"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        />
    );
};

export default CursorOverlay;