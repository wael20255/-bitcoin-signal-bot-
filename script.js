
async function getSignal() {
    document.getElementById("signal").textContent = "🔄 جاري التحليل...";
    document.getElementById("signal").className = "";

    const response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50");
    const data = await response.json();

    const closePrices = data.map(c => parseFloat(c[4]));
    const lastPrice = closePrices[closePrices.length - 1];

    function ema(prices, span) {
        const k = 2 / (span + 1);
        let emaArray = [prices[0]];
        for (let i = 1; i < prices.length; i++) {
            emaArray.push(prices[i] * k + emaArray[i - 1] * (1 - k));
        }
        return emaArray;
    }

    function rsi(prices, period = 14) {
        let gains = [], losses = [];
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change >= 0) gains.push(change);
            else losses.push(-change);
        }
        let avgGain = gains.reduce((a,b) => a + b, 0) / period;
        let avgLoss = losses.reduce((a,b) => a + b, 0) / period;

        for (let i = period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
        }

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    const ema20 = ema(closePrices, 20);
    const ema50 = ema(closePrices, 50);
    const rsiVal = rsi(closePrices);
    const macd = ema(closePrices, 12).map((v, i) => v - ema(closePrices, 26)[i]);
    const macdSignal = ema(macd, 9);

    const lastEma20 = ema20[ema20.length - 1];
    const lastEma50 = ema50[ema50.length - 1];
    const lastMacd = macd[macd.length - 1];
    const lastMacdSignal = macdSignal[macdSignal.length - 1];

    let signal = "";
    let confidence = 0;
    let reasons = [];

    if (lastEma20 > lastEma50) {
        signal = "شراء";
        confidence += 30;
        reasons.push("EMA20 > EMA50");
    } else if (lastEma20 < lastEma50) {
        signal = "بيع";
        confidence += 30;
        reasons.push("EMA20 < EMA50");
    }

    if (rsiVal > 55) {
        signal = signal || "شراء";
        confidence += 20;
        reasons.push("RSI مرتفع");
    } else if (rsiVal < 45) {
        signal = signal || "بيع";
        confidence += 20;
        reasons.push("RSI منخفض");
    }

    if (lastMacd > lastMacdSignal) {
        signal = signal || "شراء";
        confidence += 30;
        reasons.push("MACD إيجابي");
    } else if (lastMacd < lastMacdSignal) {
        signal = signal || "بيع";
        confidence += 30;
        reasons.push("MACD سلبي");
    }

    if (confidence < 40) {
        signal = "انتظار";
        reasons.push("لا توجد إشارات كافية");
    }

    let target = signal === "شراء" ? (lastPrice * 1.01).toFixed(2)
               : signal === "بيع" ? (lastPrice * 0.99).toFixed(2)
               : "لا يوجد";

    let signalEl = document.getElementById("signal");
    signalEl.textContent = `🔄 الإشارة: ${signal}`;
    signalEl.className = signal === "شراء" ? "green" : signal === "بيع" ? "red" : "gray";
    document.getElementById("price").textContent = `💰 السعر الحالي: ${lastPrice}`;
    document.getElementById("target").textContent = `🎯 الهدف المتوقع: ${target}`;
    document.getElementById("confidence").textContent = `📊 نسبة الثقة: ${confidence}%`;
    document.getElementById("conditions").textContent = `📋 المؤشرات: ${reasons.join("، ")}`;
}

// تحميل تلقائي عند الدخول
getSignal();
