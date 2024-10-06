import { useState, useEffect, useRef } from "react";

const UPBIT_URL = "wss://api.upbit.com/websocket/v1";
const useNewData = () => {
  const [minuteData, setMinuteData] = useState([]); // 분봉 데이터를 저장할 상태
  const [currentMinute, setCurrentMinute] = useState(null); // 현재 분을 추적
  const [minuteBuffer, setMinuteBuffer] = useState([]); // 1분 동안의 데이터 버퍼

  const data = [
    { ticket: "nexoneunji" },
    { type: "ticker", codes: ["KRW-BTC"], isOnlyRealtime: true },
  ];
  const ws = useRef(null);

  useEffect(() => {
    // WebSocket 연결 설정
    ws.current = new WebSocket(UPBIT_URL);
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify(data));
    };
    ws.current.onclose = () => {
      console.log("DISCONNECTED");
    };
    ws.current.onerror = (event) => {
      console.log("Error", event);
      ws.current.close();
    };

    // 메시지 수신 처리
    ws.current.onmessage = async (event) => {
      const text = await new Response(event.data).text();
      const message = JSON.parse(text);
      const {
        opening_price,
        low_price,
        high_price,
        trade_price,
        timestamp,
        trade_volume,
      } = message;

      // 현재 시간의 분 추출
      const minute = new Date(timestamp).getMinutes();

      if (currentMinute === null) {
        setCurrentMinute(minute);
      }

      // 1분 데이터 수집
      if (minute === currentMinute) {
        setMinuteBuffer((prevBuffer) => [
          ...prevBuffer,
          {
            open: opening_price,
            low: low_price,
            high: high_price,
            close: trade_price,
            volume: trade_volume,
          },
        ]);
      } else {
        // 새로운 분이 시작되면 기존 버퍼를 분봉 데이터로 추가하고 버퍼 초기화
        if (minuteBuffer.length > 0) {
          const open = minuteBuffer[0].open;
          const close = minuteBuffer[minuteBuffer.length - 1].close;
          const high = Math.max(...minuteBuffer.map((item) => item.high));
          const low = Math.min(...minuteBuffer.map((item) => item.low));
          const volume = minuteBuffer.reduce((sum, item) => sum + item.volume, 0);

          setMinuteData((prevData) => [
            ...prevData,
            { open, close, high, low, volume, timestamp: currentMinute },
          ]);
        }

        // 새로운 분으로 업데이트 및 버퍼 초기화
        setCurrentMinute(minute);
        setMinuteBuffer([
          {
            open: opening_price,
            low: low_price,
            high: high_price,
            close: trade_price,
            volume: trade_volume,
          },
        ]);
      }
    };

    return () => {
      ws.current.close();
    };
  }, [currentMinute, minuteBuffer]);

  return minuteData; // 분봉 데이터 반환
};

export default useNewData;
