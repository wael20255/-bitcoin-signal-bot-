
async function getSignal() {
  document.getElementById("signal").innerText = "جارٍ التحديث...";
  document.getElementById("confidence").innerText = "--%";

  try {
    // محاكاة إشارة لحين ربط بيانات Binance الحقيقية
    const responses = ["شراء قوي", "بيع قوي", "انتظار"];
    const confidence = Math.floor(60 + Math.random() * 40);
    const signal = responses[Math.floor(Math.random() * responses.length)];

    document.getElementById("signal").innerText = signal;
    document.getElementById("confidence").innerText = confidence + "%";
  } catch (e) {
    document.getElementById("signal").innerText = "خطأ في الاتصال";
  }
}

window.onload = getSignal;
