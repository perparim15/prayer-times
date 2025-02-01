const cityMapping = {
    "prishtina": { city: "Pristina", country: "XK" },
    "prizren": { city: "Prizren", country: "XK" },
    "mitrovica": { city: "Mitrovica", country: "XK" },
    "peja": { city: "Peja", country: "XK" },
    "gjakova": { city: "Gjakova", country: "XK" }
};

let timerInterval;

async function getPrayerTimes(cityKey) {
    const { city, country } = cityMapping[cityKey];
    try {
        const response = await fetch(
            `https://api.pray.zone/v2/times/today.json?city=${city}&country=${country}`
        );
        const data = await response.json();
        return data.results.datetime[0].times;
    } catch (error) {
        console.error('Gabim në marrjen e të dhënave:', error);
        return null;
    }
}

// Pjesa tjetër e kodit mbetet e njëjtë si më parë, me përjashtim të thirrjeve API
