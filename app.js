// Në app.js, modifiko funksionin getPrayerTimes:
async function getPrayerTimes(cityKey) {
    const { city, country } = cityMapping[cityKey];
    try {
        const response = await fetch(
            `https://api.pray.zone/v2/times/today.json?city=${city}&country=${country}&timeformat=1`
        );
        const data = await response.json();
        console.log("Të dhënat e API:", data); // Shto këtë për debug
        return data.results.datetime[0].times;
    } catch (error) {
        console.error('Gabim në marrjen e të dhënave:', error);
        return null;
    }
}
// Në app.js
function startCountdown(timings) {
    if (timerInterval) clearInterval(timerInterval);

    const prayers = [
        { name: "Fajr", time: timings.Fajr },
        { name: "Dreka", time: timings.Dhuhr },
        { name: "Ikindia", time: timings.Asr },
        { name: "Akşam", time: timings.Maghrib },
        { name: "Jacia", time: timings.Isha }
    ];

    const now = new Date();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Gjej faljen tjetër
    let nextPrayer = prayers.find(prayer => {
        const [h, m] = prayer.time.split(':');
        return (parseInt(h) * 3600 + parseInt(m) * 60) > currentTime;
    });

    // Nëse të gjitha faljet kanë kaluar
    if (!nextPrayer) {
        nextPrayer = {
            name: "Fajr (nesër)",
            time: prayers[0].time
        };
    }

    updateCountdown(nextPrayer, now);
}

function updateCountdown(nextPrayer, now) {
    const [nextH, nextM] = nextPrayer.time.split(':');
    let targetTime = new Date(now);
    
    targetTime.setHours(nextH, nextM, 0, 0);

    // Nëse është nesër
    if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    timerInterval = setInterval(() => {
        const diff = targetTime - new Date();
        
        if (diff <= 0) {
            clearInterval(timerInterval);
            location.reload();
            return;
        }

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.getElementById("timer").textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        document.querySelector("#next-prayer span").textContent = nextPrayer.name;
    }, 1000);
}
