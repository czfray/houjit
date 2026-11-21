const devMode = window.location.hostname !== "czfray.github.io";
const apiUrl = devMode ? "http://127.0.0.1:8787": "https://houjit.czfray.workers.dev";
console.log("Dev mode: " + devMode);

let station = 19;

const stationDataResponse = await fetch(`${apiUrl}?target=stations`);
const stationData = await stationDataResponse.json();

const tempDataResponse = await fetch(`${apiUrl}?target=report`);
const tempData = await tempDataResponse.json();

console.log(tempData);

const humidViewer = document.getElementById("humid");
humidViewer.textContent = tempData.data[station].humid + "%";

const windViewer = document.getElementById("wind");
windViewer.textContent = tempData.data[station].windSpd + " km/h";

function formatHkTime(date){
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date(date));
}
