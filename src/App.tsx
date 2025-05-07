import React, { useEffect, useRef, useState } from "react";

type MotionMessage = {
    type: "motion";
    data: string[];
};

const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
};

const App = () => {
    const [image, setImage] = useState<string | null>(null);
    const [motions, setMotions] = useState<string[]>([]);
    const motionsRef = useRef<string[]>([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = () => {
            console.log("✅ WebSocket 연결 성공");
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket 연결 에러:", error);
        };

        ws.onclose = () => {
            console.log("❌ WebSocket 닫힘");
        };

        ws.onmessage = async (event) => {
            if (typeof event.data === "string") {
                const message: MotionMessage = JSON.parse(event.data);
                if (message.type === "motion" && message.data.length > 0) {
                    if (!arraysEqual(message.data, motionsRef.current)) {
                        setMotions(message.data);
                        motionsRef.current = message.data;
                    }
                }
            } else {
                const blob = new Blob([event.data], { type: "image/jpeg" });
                const imageUrl = URL.createObjectURL(blob);
                setImage(imageUrl);
            }
        };

        return () => ws.close();
    }, []); 

    return (
        <div style={{ padding: 20 }}>
            <h1>실시간 모션 감지 시스템 🕺</h1>

            {image && (
                <img
                    src={image}
                    alt="실시간 영상"
                    style={{
                        width: "640px",
                        height: "480px",
                        border: "2px solid #ddd",
                        borderRadius: 8,
                        marginBottom: 20,
                    }}
                />
            )}

            <div
                style={{
                    padding: 15,
                    background: "#f0f0f0",
                    borderRadius: 10,
                }}
            >
                <h3>감지된 동작 🔍</h3>
                {motions.length > 0 ? (
                    motions.map((motion, index) => (
                        <div
                            key={index}
                            style={{
                                color: "red",
                                padding: "8px",
                                margin: "5px 0",
                                background: "#ffe5e5",
                                borderRadius: 5,
                            }}
                        >
                            {motion}
                        </div>
                    ))
                ) : (
                    <div style={{ color: "#666" }}>동작이 감지되지 않았습니다</div>
                )}
            </div>
        </div>
    );
};

export default App;
