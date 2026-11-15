const devMode = window.location.hostname !== "czfray.github.io";
const apiUrl = devMode ? "http://127.0.0.1:8787": "https://houjit.czfray.workers.dev";
console.log("Dev mode: " + devMode);

let station = 19;

const stationDataResponse = await fetch(`${apiUrl}?target=stations`);
const stationData = await stationDataResponse.json();

const tempDataResponse = await fetch(`${apiUrl}?target=temp`);
const tempData = await tempDataResponse.json();

console.log(tempData);

const stationViewer = document.getElementById("station");
stationViewer.textContent = stationData[station].name.tc + " " + stationData[station].name.en;

if (station in tempData.data) {
    const testViewer = document.getElementById("test");
    testViewer.textContent = tempData.data[station].temp + "°";

    const test2Viewer = document.getElementById("test2");
    test2Viewer.textContent = tempData.data[station].minTemp + "° - " + tempData.data[station].maxTemp + "°";

}


