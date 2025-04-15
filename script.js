
async function fetchSignal() {
    const signalBox = document.getElementById("signal");
    signalBox.textContent = "جاري التحميل...";

    try {
        const response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50");
        const data = await response.json();

        const closes = data.map(item => parseFloat(item[4]));
        
        // Calculate EMA
        function calculateEMA(period, prices) {
            const k = 2 / (period + 1);
            let emaArray = [];
            emaArray[0] = prices[0];
            for (let i = 1; i < prices.length; i++) {
                emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
            }
            return emaArray;
        }

        // RSI Calculation
        function calculateRSI(prices, period = 14) {
            let gains = 0, losses = 0;
            for (let i = 1; i <= period; i++) {
                const change = prices[i] - prices[i - 1];
                if (change >= 0) gains += change;
                else losses -= change;
            }
            let avgGain = gains / period;
            let avgLoss = losses / period;
            let rs = avgGain / avgLoss;
            return 100 - (100 / (1 + rs));
        }

        const ema20 = calculateEMA(20, closes);
        const ema50 = calculateEMA(50, closes);
        const rsi = calculateRSI(closes);

        let signal = "";
        let confidence = 0;

        if (ema20.at(-1) > ema50.at(-1) && rsi < 70 && rsi > 50) {
            signal = "🔼 شراء قوي";
            confidence = 85;
        } else if (ema20.at(-1) < ema50.at(-1) && rsi > 30 && rsi < 50) {
            signal = "🔽 بيع قوي";
            confidence = 80;
        } else {
            signal = "⏸️ لا توجد إشارة واضحة الآن";
            confidence = 50;
        }

        signalBox.textContent = `${signal} - الثقة: ${confidence}%`;

    } catch (error) {
        signalBox.textContent = "حدث خطأ أثناء جلب البيانات.";
    }
}

fetchSignal();
