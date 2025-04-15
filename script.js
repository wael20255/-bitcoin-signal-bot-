
async function getSignals() {
  const assets = [
    { symbol: "BTCUSDT", label: "btc" },
    { symbol: "XAUUSDT", label: "gold" }
  ];

  for (const asset of assets) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${asset.symbol}&interval=1h&limit=50`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const closes = data.map(candle => parseFloat(candle[4]));
      const volumes = data.map(candle => parseFloat(candle[5]));
      const lastClose = closes[closes.length - 1];
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

      // RSI
      const gains = [];
      const losses = [];
      for (let i = 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains.push(diff);
        else losses.push(Math.abs(diff));
      }
      const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
      const rs = avgGain / (avgLoss || 1);
      const rsi = 100 - 100 / (1 + rs);

      // دعم ومقاومة (بسيط من أعلى وأدنى)
      const high = Math.max(...closes.slice(-10));
      const low = Math.min(...closes.slice(-10));
      const support = low.toFixed(2);
      const resistance = high.toFixed(2);

      // إشارة دخول
      let signal = "🔁 انتظار";
      let entryType = "غير متاح";
      let reason = "لا توجد مؤشرات كافية للدخول";
      let target = "غير محدد";
      let stop = "غير محدد";

      if (rsi > 55 && lastClose > closes[closes.length - 2]) {
        signal = "✅ شراء";
        entryType = "دخول سريع";
        target = (lastClose + (resistance - lastClose) * 0.8).toFixed(2);
        stop = (support - 0.5).toFixed(2);
        reason = `RSI إيجابي (${rsi.toFixed(1)}), والسعر أعلى من السابق`;
      } else if (rsi < 45 && lastClose < closes[closes.length - 2]) {
        signal = "❌ بيع";
        entryType = "دخول سريع";
        target = (lastClose - (lastClose - support) * 0.8).toFixed(2);
        stop = (resistance + 0.5).toFixed(2);
        reason = `RSI سلبي (${rsi.toFixed(1)}), والسعر أقل من السابق`;
      }

      // عرض النتائج
      document.getElementById(`${asset.label}-signal`).textContent = `🔄 الإشارة: ${signal}`;
      document.getElementById(`${asset.label}-price`).textContent = `💰 السعر الحالي: ${lastClose.toFixed(2)}`;
      document.getElementById(`${asset.label}-entry`).textContent = `✳️ نوع الدخول: ${entryType}`;
      document.getElementById(`${asset.label}-target`).textContent = `🎯 الهدف المتوقع: ${target}`;
      document.getElementById(`${asset.label}-stop`).textContent = `🛑 وقف الخسارة: ${stop}`;
      document.getElementById(`${asset.label}-volume`).textContent = `📊 حجم التداول: ${avgVolume.toFixed(0)}`;
      document.getElementById(`${asset.label}-support`).textContent = `🔻 الدعم: ${support}`;
      document.getElementById(`${asset.label}-resistance`).textContent = `🔺 المقاومة: ${resistance}`;
      document.getElementById(`${asset.label}-reasons`).textContent = `📋 الأسباب: ${reason}`;

    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
  }
}
