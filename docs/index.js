import *  as Utils from "./scripts/utils.js";

const devMode = window.location.hostname !== "czfray.github.io";
const apiUrl = devMode ? "http://127.0.0.1:8787": "https://houjit.czfray.workers.dev";
console.log("Dev mode: " + devMode);

const lat = 1.2942595;
const lon = 103.7694243;

const reportResponse = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}`);
const report = await reportResponse.json();

console.log(report);

const uvViewer = document.getElementById("uv");
uvViewer.textContent = report.data["uv"];

const humidViewer = document.getElementById("humid");
humidViewer.textContent = report.data["humid"] + "%";

const windViewer = document.getElementById("wind");
windViewer.textContent = report.data["windSpd"] + " km/h";

const tempViewer = document.getElementById("temp");
tempViewer.textContent = Number(report.data["temp"]).toFixed(1) + "°";

const minTempViewer = document.getElementById("minTemp");
minTempViewer.textContent = Number(report.data["minTemp"]).toFixed(1) + "°";

const maxTempViewer = document.getElementById("maxTemp");
maxTempViewer.textContent = Number(report.data["maxTemp"].toFixed(1)) + "°";

const aprntTempViewer = document.getElementById("aprntTemp");
aprntTempViewer.textContent = Utils.getApparentTemp(report.data["temp"], report.data["humid"], report.data["windSpd"]).toFixed(1) + "°";

const workerDelay = Math.floor((new Date() - new Date(report["workerTime"])) / 60000);
const hkoDelay = Math.floor((new Date(report["workerTime"]) - new Date(report["hkoTime"]))/60000);

const lastUpdateViewer = document.getElementById("lastUpdate");
lastUpdateViewer.textContent = `Last Updated ${workerDelay}+${hkoDelay} mins ago`;

