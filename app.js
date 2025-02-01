const coordinates = {
    "prishtina": { lat: 42.6667, lng: 21.1667 }, // Prishtinë
    "prizren": { lat: 42.2139, lng: 20.7397 },   // Prizren
    "mitrovica": { lat: 42.8914, lng: 20.8660 }, // Mitrovicë
    "peja": { lat: 42.6609, lng: 20.2884 },      // Pejë
    "gjakova": { lat: 42.3803, lng: 20.4308 }    // Gjakovë
};

async function getPrayerTimes(cityKey) {
    const { lat, lng } = coordinates[cityKey];
    const date = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=2`
        );
        const data = await response.json();
        return data.data.timings;
    } catch (error) {
        console.error('Gabim në marrjen e të dhënave:', error);
        return null;
    }
}
async function updatePrayerTimes() {
    const city = document.getElementById("cities").value;
    const timings = await getPrayerTimes(city);

    if (timings) {
        console.log("Të dhënat e marra:", timings); // Shiko në konsolë
        displayPrayerTimes(timings, city);
        startCountdown(timings);
    } else {
        console.log("Nuk u morën të dhëna"); // Gabim nëse API nuk përgjigjet
    }
}
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
