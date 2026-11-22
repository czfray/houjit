import *  as Utils from "./scripts/utils.js"

const devMode = window.location.hostname !== "czfray.github.io";
const apiUrl = devMode ? "http://127.0.0.1:8787": "https://houjit.czfray.workers.dev";
console.log("Dev mode: " + devMode);

let station = 19;

const tempDataResponse = await fetch(`${apiUrl}?target=report`);
const tempData = await tempDataResponse.json();

console.log(tempData);

const uvViewer = document.getElementById("uv");
uvViewer.textContent = tempData.data["global"].uv;

const humidViewer = document.getElementById("humid");
humidViewer.textContent = tempData.data["stationSpec"][station].humid + "%";

const windViewer = document.getElementById("wind");
windViewer.textContent = tempData.data["stationSpec"][station].windSpd + " km/h";

const tempViewer = document.getElementById("temp");
tempViewer.textContent = Number(tempData.data["stationSpec"][station].temp).toFixed(1) + "°";

const minTempViewer = document.getElementById("minTemp");
minTempViewer.textContent = Number(tempData.data["stationSpec"][station].minTemp).toFixed(1) + "°";

const maxTempViewer = document.getElementById("maxTemp");
maxTempViewer.textContent = Number(tempData.data["stationSpec"][station].maxTemp.toFixed(1)) + "°";

const aprntTempViewer = document.getElementById("aprntTemp");
aprntTempViewer.textContent = Utils.getApparentTemp(tempData.data["stationSpec"][station].temp, tempData.data["stationSpec"][station].humid, tempData.data["stationSpec"][station].windSpd).toFixed(1) + "°";

const workerDelay = Math.floor((new Date() - new Date(tempData["workerTime"])) / 60000);
const hkoDelay = Math.floor((new Date(tempData["workerTime"]) - new Date(tempData["hkoTime"]))/60000);

const lastUpdateViewer = document.getElementById("lastUpdate");
lastUpdateViewer.textContent = `Last Updated ${workerDelay}+${hkoDelay} mins ago`;

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
