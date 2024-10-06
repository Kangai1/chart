import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import getInitialDataList from './getInitialDataList'; // 수정된 getInitialDataList 함수 임포트

const ChartComponent = () => {
  const [interval, setInterval] = useState(1); // 기본값을 1분봉으로 설정
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 주기가 변경될 때마다 새로운 데이터를 가져옴
    getInitialDataList(interval).then(data => {
      setChartData({
        labels: data.map(item => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: 'Price',
            data: data.map(item => item.close),
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
          },
        ],
      });
    });
  }, [interval]); // interval이 변경될 때마다 호출

  return (
    <div>
      <div>
        {/* 봉 주기를 변경할 수 있는 버튼들 */}
        <button onClick={() => setInterval(1)}>1분봉</button>
        <button onClick={() => setInterval(5)}>5분봉</button>
        <button onClick={() => setInterval(60)}>1시간봉</button>
        <button onClick={() => setInterval(1440)}>1일봉</button>
      </div>
      {chartData && (
        <Line
          data={chartData}
          options={{
            scales: {
              x: { display: true },
              y: { display: true }
            }
          }}
        />
      )}
    </div>
  );
};

export default ChartComponent;
