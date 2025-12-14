import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './css/Cursor.css';

const Cursor = () => {
    const location = useLocation();
    const isMainPage = location.pathname === '/';

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [hoveringCard, setHoveringCard] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isHiddenTemporarily, setIsHiddenTemporarily] = useState(false);

    useEffect(() => {
        const move = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    useEffect(() => {
        const attachEvents = () => {
            const cards = document.querySelectorAll('.grid-item');
            cards.forEach((card) => {
                card.addEventListener('mouseenter', handleEnter);
                card.addEventListener('mouseleave', handleLeave);
                card.addEventListener('click', handleClick);
            });
        };

        const detachEvents = () => {
            const cards = document.querySelectorAll('.grid-item');
            cards.forEach((card) => {
                card.removeEventListener('mouseenter', handleEnter);
                card.removeEventListener('mouseleave', handleLeave);
                card.removeEventListener('click', handleClick);
            });
        };

        const handleEnter = () => setHoveringCard(true);
        const handleLeave = () => setHoveringCard(false);
        const handleClick = () => {
            setIsHiddenTemporarily(true);
            setTimeout(() => {
                setIsHiddenTemporarily(false);
            }, 300);
        };

        attachEvents();

        const observer = new MutationObserver(() => {
            detachEvents();
            attachEvents();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            detachEvents();
            observer.disconnect();
        };
    }, []);

    if (!isVisible || !isMainPage) return null;

    return (
        <div
            className={`custom-cursor ${hoveringCard ? 'cursor-hover' : ''} ${isHiddenTemporarily ? 'hidden' : ''}`}
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {hoveringCard && <span className="cursor-text">explore</span>}
        </div>
    );
};

export default Cursor;