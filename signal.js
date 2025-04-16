export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    const data = await response.json();

    const price = parseFloat(data.lastPrice);
    const changePercent = parseFloat(data.priceChangePercent);

    const direction = changePercent > 0 ? "صعود قوي 🚀" : "هبوط حاد 📉";
    const confidence = Math.min(Math.abs(changePercent * 10), 100).toFixed(0);
    const target = (price + price * 0.02).toFixed(2) + " $";
    const stopLoss = (price - price * 0.015).toFixed(2) + " $";

    res.status(200).json({
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      direction,
      confidence,
      target,
      stopLoss,
      platforms: ["Binance"],
      analysis: `التغير خلال 24 ساعة: ${changePercent.toFixed(2)}%`,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "فشل في جلب بيانات الإشارة" });
  }
}
