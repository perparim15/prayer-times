// app.js

// 1. Konfigurimi i qyteteve me koordinatat gjeografike
const coordinates = {
    "prishtina": { lat: 42.6667, lng: 21.1667 }, // Prishtinë
    "prizren": { lat: 42.2139, lng: 20.7397 },   // Prizren
    "mitrovica": { lat: 42.8914, lng: 20.8660 }, // Mitrovicë
    "peja": { lat: 42.6609, lng: 20.2884 },      // Pejë
    "gjakova": { lat: 42.3803, lng: 20.4308 }    // Gjakovë
};

// 2. Funksioni për marrjen e kohëve të namazit nga API
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

// 3. Funksioni për shfaqjen e kohëve në tabelë
function displayPrayerTimes(timings, cityName) {
    const prayerTimesHTML = `
        <h2>${cityName}</h2>
        <table>
            <tr><th>Namazi</th><th>Koha</th></tr>
            <tr><td>Fajr</td><td>${timings.Fajr}</td></tr>
            <tr><td>Dreka</td><td>${timings.Dhuhr}</td></tr>
            <tr><td>Ikindia</td><td>${timings.Asr}</td></tr>
            <tr><td>Akşam</td><td>${timings.Maghrib}</td></tr>
            <tr><td>Jacia</td><td>${timings.Isha}</td></tr>
        </table>
    `;
    document.getElementById("prayer-times").innerHTML = prayerTimesHTML;
}

// 4. Funksioni për llogaritjen e countdown
function startCountdown(timings) {
    let timerInterval;

    const prayers = [
        { name: "Fajr", time: timings.Fajr },
        { name: "Dreka", time: timings.Dhuhr },
        { name: "Ikindia", time: timings.Asr },
        { name: "Akşam", time: timings.Maghrib },
        { name: "Jacia", time: timings.Isha }
    ];

    const now = new Date();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Gjej faljen e parë që nuk ka filluar
    const nextPrayer = prayers.find(prayer => {
        const [h, m] = prayer.time.split(':');
        return (h * 3600 + m * 60) > currentTime;
    }) || { name: "Fajr (nesër)", time: prayers[0].time };

    // Konverto kohën e namazit në Date objekt
    const [nextH, nextM] = nextPrayer.time.split(':');
    const targetTime = new Date();
    targetTime.setHours(nextH, nextM, 0, 0);

    // Nëse koha ka kaluar, shto 1 ditë
    if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);

    // Rifresko countdown çdo sekondë
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

// 5. Funksioni kryesor që lidh gjithçka
async function updatePrayerTimes() {
    const cityKey = document.getElementById("cities").value;
    const cityName = document.getElementById("cities").options[document.getElementById("cities").selectedIndex].text;
    const timings = await getPrayerTimes(cityKey);

    if (timings) {
        displayPrayerTimes(timings, cityName);
        startCountdown(timings);
    }
}

// 6. Event Listeners dhe inicializimi
document.getElementById("cities").addEventListener("change", updatePrayerTimes);

// Nisja fillestare
window.onload = async () => {
    await updatePrayerTimes();
};
