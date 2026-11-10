import stationsData from "./stations.json";
const aliasMap = stationsData.aliases.temp;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const target = url.searchParams.get("target");

        switch (target) {
            case "temp":
                const tempData = await fetchTempData();
                return Response.json(tempData);
            case "stations":
                return Response.json(stationsData.stations);
            default:
                return Response.json(
                    { error: "Target parameter missing/invalid" },
                    { status: 400 }
                );
        }
    }
};

async function fetchTempData() {
    const rawTempDataResponse = await fetch("https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_temperature.csv");
    if (!rawTempDataResponse.ok) {
        throw new Error(`HKO API error: ${rawTempDataResponse.status}`);
    }
    const rawTempData = await rawTempDataResponse.text();

    let tempData = {};
    for (const rawTempDataLine of rawTempData.trim().split("\n").slice(1)) {
        const stationTempData = rawTempDataLine.split(",");
        const stationId = Number(aliasMap[stationTempData[1]]);
        const stationTemp = Number(stationTempData[2]);
        if (isNaN(stationId)) {
            console.log(stationTempData[1] + " does not have a valid alias map.");
            continue;
        }
        if (!tempData["time"]) tempData["time"] = hkoTimeFormat(stationTempData[0]);
        if (!tempData["data"]) tempData["data"] = {};
        tempData["data"][stationId] = stationTemp;
    }
    return tempData;
}

function hkoTimeFormat(hkoTime){
    const year = hkoTime.slice(0, 4);
    const month = hkoTime.slice(4, 6);
    const day = hkoTime.slice(6, 8);
    const hour = hkoTime.slice(8, 10);
    const minute = hkoTime.slice(10, 12);
    return `${day}/${month}/${year}, ${hour}:${minute}`;
}