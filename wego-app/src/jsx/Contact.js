import { useState, useRef, useEffect } from "react";
import "../css/Contact.css";
import chatIcon from "../images/wegochat.png"; // 아이콘 불러오기

export const Contact = ({ isOpen, setIsOpen }) => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [buttonText, setButtonText] = useState("Send");
  const bottomRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 25, y: 80 });
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const onMouseDown = (e) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - dragRef.current.getBoundingClientRect().left,
      y: e.clientY - dragRef.current.getBoundingClientRect().top,
    };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x:
        window.innerWidth -
        (e.clientX - offset.current.x) -
        dragRef.current.offsetWidth,
      y:
        window.innerHeight -
        (e.clientY - offset.current.y) -
        dragRef.current.offsetHeight,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s)>\]}]+)/g;
    return text.split(urlRegex).map((part, idx) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { type: "user", text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setButtonText("Thinking...");

    try {
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({ prompt: question }),
      });

      const data = await response.json();
      const aiReply = data.answer || "AI 응답 없음";

      setChatHistory((prev) => [...prev, { type: "ai", text: aiReply }]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { type: "ai", text: "서버 오류. 다시 시도해주세요." },
      ]);
    }

    setButtonText("Send");
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-floating-btn" onClick={() => setIsOpen(true)}>
          <img src={chatIcon} alt="Chat" style={{ width: "32px", height: "32px" }} />
        </button>
      )}

      {isOpen && (
        <div
          ref={dragRef}
          className="chat-popup"
          style={{
            bottom: `${position.y}px`,
            right: `${position.x}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {/* 헤더 */}
          <div className="chat-header" onMouseDown={onMouseDown}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img src={chatIcon} alt="WE-GO 여행 도우미" className="chat-header-icon" />
              <span>WE-GO 여행 도우미</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          {/* 대화 */}
          <div className="chat-history">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.type === "user" ? "user-bubble" : "ai-bubble"
                  }`}
              >
                {formatMessage(msg.text)}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <form onSubmit={handleSubmit} className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button type="submit" className="chat-submit">
              {buttonText}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
