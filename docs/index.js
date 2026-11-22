import * as Utils from "./scripts/utils.js";
import * as GPS from "./scripts/gps.js";

const devMode = window.location.hostname !== "czfray.github.io";
const apiUrl = devMode ? "http://127.0.0.1:8787": "https://houjit.czfray.workers.dev";
console.log("Dev mode: " + devMode);

const uvViewer = document.getElementById("uv");
const humidViewer = document.getElementById("humid");
const windViewer = document.getElementById("wind");
const tempViewer = document.getElementById("temp");
const minTempViewer = document.getElementById("minTemp");
const maxTempViewer = document.getElementById("maxTemp");
const aprntTempViewer = document.getElementById("aprntTemp");
const lastUpdateViewer = document.getElementById("lastUpdate");

let coords;
update();
setInterval(update, 2.5 * 60 * 1000);


async function update() {
    coords = await GPS.getGpsLocation();
    console.log("Location obtained: " + coords);
    if (coords == null) {
        coords = [22.30194444, 114.17416667];
    }

    const reportResponse = await fetch(`${apiUrl}?lat=${coords[0]}&lon=${coords[1]}`);
    const report = await reportResponse.json();

    console.log(report);

    uvViewer.textContent = report.data["uv"];
    humidViewer.textContent = report.data["humid"] + "%";
    windViewer.textContent = report.data["windSpd"] + " km/h";
    tempViewer.textContent = Number(report.data["temp"]).toFixed(1) + "°";
    minTempViewer.textContent = Number(report.data["minTemp"]).toFixed(1) + "°";
    maxTempViewer.textContent = Number(report.data["maxTemp"].toFixed(1)) + "°";
    aprntTempViewer.textContent = Utils.getApparentTemp(report.data["temp"], report.data["humid"], report.data["windSpd"]).toFixed(1) + "°";
    const workerDelay = Math.floor((new Date() - new Date(report["workerTime"])) / 60000);
    const hkoDelay = Math.floor((new Date(report["workerTime"]) - new Date(report["hkoTime"])) / 60000);
    lastUpdateViewer.textContent = `Last Updated ${workerDelay}+${hkoDelay} mins ago`;

}
