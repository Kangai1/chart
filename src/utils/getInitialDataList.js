import axios from "axios";

const getInitialDataList = (interval, period, market) => {
  const apiUrl =
    interval === 1440
      ? `https://api.upbit.com/v1/candles/days`
      : `https://api.upbit.com/v1/candles/minutes/${interval}`;

  return axios
    .get(apiUrl, {
      params: {
        market: market, // Use the selected market
        to: new Date(
          +new Date() + 3240 * 10000
        ).toISOString().replace("T", " ").replace(/\..*/, ""),
        count: period / interval, // Calculate the number of data points based on the period
      },
    })
    .then((res) => res.data)
    .then((data) => {
      return data.map((item) => {
        const {
          opening_price,
          low_price,
          high_price,
          trade_price,
          timestamp,
          candle_acc_trade_volume,
        } = item;
        return {
          open: opening_price,
          low: low_price,
          high: high_price,
          close: trade_price,
          volume: candle_acc_trade_volume,
          timestamp:
            interval === 1440
              ? Math.floor(timestamp / 24 / 60 / 60 / 1000) * 24 * 60 * 60 * 1000
              : timestamp,
          turnover:
            ((opening_price + low_price + high_price + trade_price) / 4) *
            candle_acc_trade_volume,
        };
      });
    })
    .then((arr) => arr.reverse())
    .catch((err) => {
      console.error(err);
    });
};

export default getInitialDataList;
