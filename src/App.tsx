import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = event.data;

      if (typeof data === "string") {
        // 텍스트 메시지 처리
        setMessage(data); 
        console.log("받은 텍스트 메시지:", data);
      } else if (data instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          setImage(imageUrl);
        };
        reader.readAsDataURL(data); 
      }
    };

    ws.onopen = () => {
      console.log("웹소켓 연결됨");
    };

    ws.onerror = (error) => {
      console.error("웹소켓 오류:", error);
    };

    ws.onclose = () => {
      console.log("웹소켓 연결 종료됨");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>PAMO</h1>
      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}
      {image && (
        <img
          src={image}
          alt="Webcam Stream"
          style={{ width: "640px", height: "480px", objectFit: "cover" }}
        />
      )}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default App;
