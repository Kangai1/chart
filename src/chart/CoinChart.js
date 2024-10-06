import React, { useState, useEffect } from "react";
import { init, dispose } from "klinecharts";

import Layout from "../Layout";
import useNewData from "../hooks/useNewData";
import getInitialDataList from "../utils/getInitialDataList";
import getLanguageOption from "../utils/getLanguageOption";

const types = [
  { key: "candle_solid", text: "캔들" },
  { key: "candle_stroke", text: "투명 캔들" },
  { key: "ohlc", text: "Bar 형식의 OHLC" },
  { key: "area", text: "Mountain" },
];

const intervals = [
  { key: 1, text: "1분봉" },
  { key: 5, text: "5분봉" },
  { key: 60, text: "1시간봉" },
  { key: 1440, text: "1일봉" },
];

const periods = [
  { key: 1, text: "하루", count: 24 * 60 },
  { key: 7, text: "일주일", count: 7 * 24 * 60 },
  { key: 30, text: "한달", count: 30 * 24 * 60 },
  { key: 365, text: "1년", count: 365 * 24 * 60 },
];

const markets = [
  { key: "KRW-BTC", text: "Bitcoin (BTC-KRW)" },
  { key: "KRW-ETH", text: "Ethereum (ETH-KRW)" },
  { key: "KRW-XRP", text: "Ripple (XRP-KRW)" },
  // 원하는 종목을 여기에 추가할 수 있습니다.
];

const CoinChart = () => {
  let chart;
  const [initialized, setInitialized] = useState(false);
  const [interval, setInterval] = useState(1); // Default to 1-minute interval
  const [period, setPeriod] = useState(periods[0].count); // Default to 1-day period
  const [market, setMarket] = useState(markets[0].key); // Default to Bitcoin
  const newData = useNewData();

  useEffect(() => {
    chart = init("coin-chart");
    chart.setStyleOptions(getLanguageOption());

    const fetchData = async () => {
      const dataList = await getInitialDataList(interval, period, market);
      chart.applyNewData(dataList);
      setInitialized(true);
    };

    fetchData();
    return () => {
      dispose("coin-chart");
    };
  }, [interval, period, market]); // Re-fetch data when interval, period, or market changes

  useEffect(() => {
    chart = init("coin-chart");
    if (initialized) {
      chart.updateData(newData);
    }
  }, [newData]);

  return (
    <Layout title={`${markets.find((m) => m.key === market).text} 실시간 가격 조회`}>
      <div className="app">
        <div className="chart-container">
          <div id="coin-chart" className="coin-chart" />
          <div className="chart-menu-container">
            {types.map(({ key, text }) => (
              <button
                key={key}
                onClick={() => {
                  chart.setStyleOptions({
                    candle: {
                      type: key,
                    },
                  });
                }}
              >
                {text}
              </button>
            ))}
            {intervals.map(({ key, text }) => (
              <button
                key={key}
                onClick={() => {
                  setInterval(key);
                }}
              >
                {text}
              </button>
            ))}
            {periods.map(({ key, text, count }) => (
              <button
                key={key}
                onClick={() => {
                  setPeriod(count);
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
        <div className="right-panel">
          <select
            onChange={(e) => setMarket(e.target.value)}
            value={market}
            className="market-selector"
          >
            {markets.map(({ key, text }) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Layout>
  );
};

export default CoinChart;
