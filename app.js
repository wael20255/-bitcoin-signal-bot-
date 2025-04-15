function getSignal() {
  const fakePrice = 85500;
  const ema9 = 85300;
  const ema21 = 85000;
  const rsi = 60;
  const signalText = document.getElementById("signal");

  if (ema9 > ema21 && rsi > 50 && rsi < 70) {
    signalText.innerText = "🔼 إشارة شراء - الزخم صاعد";
  } else if (ema9 < ema21 && rsi < 50 && rsi > 30) {
    signalText.innerText = "🔽 إشارة بيع - الزخم هابط";
  } else {
    signalText.innerText = "⏸️ لا توجد إشارة واضحة الآن";
  }
}