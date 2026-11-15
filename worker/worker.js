import stationsData from "./stations.json";
const aliasMap = stationsData.aliases.temp;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const target = url.searchParams.get("target");

        switch (target) {
            case "temp":
                let tempData = {};
                tempData = await fetchTempData(tempData);
                tempData = await fetchMinMaxTempData(tempData);
                return getCORSResponse(tempData);
            case "stations":
                return getCORSResponse(stationsData.stations);
            default:
                return Response.json(
                    { error: "Target parameter missing/invalid" },
                    { status: 400 }
                );
        }
    }
};

function getCORSResponse(data) {
    return Response.json(data, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    });
}

async function fetchMinMaxTempData(appendData) {
    const rawTempDataResponse = await fetch("https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_since_midnight_maxmin.csv");
    if (!rawTempDataResponse.ok) {
        throw new Error(`HKO API error: ${rawTempDataResponse.status}`);
    }
    const rawTempData = await rawTempDataResponse.text();

    let tempData = appendData;
    for (const rawTempDataLine of rawTempData.trim().split("\n").slice(1)) {
        const stationTempData = rawTempDataLine.split(",");

        if (!(stationTempData[1] in aliasMap)) {
            console.log(stationTempData[1] + " does not have a valid alias map.");
            continue;
        }

        if (!isFinite(stationTempData[2])){
            console.log(stationTempData[2] + " is not a valid temperature.");
            continue;
        }

        if (!isFinite(stationTempData[3])){
            console.log(stationTempData[3] + " is not a valid temperature.");
            continue;
        }

        const stationId = Number(aliasMap[stationTempData[1]]);
        const stationMinTemp = Number(stationTempData[3]);
        const stationMaxTemp = Number(stationTempData[2]);
        if (!tempData["time"]) tempData["time"] = hkoTimeFormat(stationTempData[0]);
        if (!tempData["data"]) tempData["data"] = {};
        if (!tempData["data"][stationId]) tempData["data"][stationId] = {};
        tempData["data"][stationId]["minTemp"] = stationMinTemp;
        tempData["data"][stationId]["maxTemp"] = stationMaxTemp;
    }
    return tempData;
}

async function fetchTempData(appendData) {
    const rawTempDataResponse = await fetch("https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_temperature.csv");
    if (!rawTempDataResponse.ok) {
        throw new Error(`HKO API error: ${rawTempDataResponse.status}`);
    }
    const rawTempData = await rawTempDataResponse.text();

    let tempData = appendData;
    for (const rawTempDataLine of rawTempData.trim().split("\n").slice(1)) {
        const stationTempData = rawTempDataLine.split(",");

        if (!(stationTempData[1] in aliasMap)) {
            console.log(stationTempData[1] + " does not have a valid alias map.");
            continue;
        }

        if (!isFinite(stationTempData[2])){
            console.log(stationTempData[2] + " is not a valid temperature.");
            continue;
        }

        const stationId = Number(aliasMap[stationTempData[1]]);
        const stationTemp = Number(stationTempData[2]);
        if (!tempData["time"]) tempData["time"] = hkoTimeFormat(stationTempData[0]);
        if (!tempData["data"]) tempData["data"] = {};
        if (!tempData["data"][stationId]) tempData["data"][stationId] = {};
        tempData["data"][stationId]["temp"] = stationTemp;
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