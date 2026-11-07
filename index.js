let response = await fetch("stations.json");
const stationsData = await response.json();
const aliasMap = stationsData["aliases"]["temp"]

response = await fetch("https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_temperature.csv");
const rawTempData = await response.text();

let tempData = {};
for (const rawTempDataLine of rawTempData.trim().split("\n").slice(1)){
    const stationTempData = rawTempDataLine.split(",");
    const stationId = Number(aliasMap[stationTempData[1]]);
    const stationTemp = Number(stationTempData[2]);
    if (isNaN(stationId)) {
        console.log(stationTempData[1] + " does not have a valid alias map.");
        continue;
    }
    tempData[stationId] = stationTemp;
}


const testViewer = document.getElementById("test");
testViewer.textContent = tempData[7] + "°";