import * as Utils from "./utils.js"

let report;
let aliasMap;

export async function fetchTenMinReport(_aliasMap){
    report = {};
    aliasMap = _aliasMap;

    await Promise.all([
        fetchAirTempData(),
        fetchMinMaxTempData(),
        fetchHumidity()
    ]);

    return report;
}

async function fetchAirTempData(){
    const airTempUrl = "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_temperature.csv";
    await mapCsvToReport(airTempUrl, {
        "station" : {
            "index": 1
        },
        "time" : {
            "index": 0
        },
        "temp" : {
            "index": 2,
            "type": "number"
        }
    });
}

async function fetchMinMaxTempData(){
    const airTempUrl = "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_since_midnight_maxmin.csv";
    await mapCsvToReport(airTempUrl, {
        "station" : {
            "index": 1
        },
        "time" : {
            "index": 0
        },
        "maxTemp" : {
            "index": 2,
            "type": "number",
            "note": "*end"
        },
        "minTemp" : {
            "index": 3,
            "type": "number",
            "note": "*end"
        }
    });
}

async function fetchHumidity(){
    const airTempUrl = "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_humidity.csv";
    await mapCsvToReport(airTempUrl, {
        "station" : {
            "index": 1
        },
        "time" : {
            "index": 0
        },
        "humid" : {
            "index": 2,
            "type": "number"
        }
    });
}

async function mapCsvToReport(csvUrl, mapping){
    await Utils.processHkoCsv(csvUrl, (dataInLine) => {

        //First look up for stationId
        if (!("station" in mapping)) throw new Error("\"station\" is not added to CSV to report mapping.");

        const statonIdIndex = mapping["station"].index;
        if (isInvalidIndex(statonIdIndex, dataInLine.length)) throw new Error(`CSV to report mapping is incorrect: ${statonIdIndex} is not a valid index.`);
        if (!(dataInLine[statonIdIndex] in aliasMap)) throw new Error(dataInLine[statonIdIndex] + " does not have a valid alias map.");
        if (!Number.isInteger(aliasMap[dataInLine[statonIdIndex]])) throw new Error(dataInLine[statonIdIndex] + "'s alias map is not an integer.");
        const stationId = Number(aliasMap[dataInLine[statonIdIndex]]);

        if (!report["data"]) report["data"] = {};
        if (!report["data"][stationId]) report["data"][stationId] = {};

        for (let name of Object.keys(mapping)){

            if (name === "station") continue; //We have extracted the info already

            if (isInvalidIndex(mapping[name].index, dataInLine.length)){
                throw new Error(`CSV to report mapping is incorrect: ${mapping[name].index} is not a valid index.`);
            }

            const index = Number(mapping[name].index);
            const type = mapping[name].type;
            let data = dataInLine[index];

            if (name === "time") {
                if (report["time"]) continue;
                if (typeof data !== "string" || data.length !== 12) {
                    console.log(data + " is not a valid HKO time.");
                    continue;
                }
                report["time"] = Utils.formatHkoTime(dataInLine[index]);
                continue;
            }

            switch (mapping[name].note){
                case "*end":
                    if (data.endsWith("*")) {
                        data = data.slice(0, -1);
                    }
                default:
                    break;
            }

            switch (type){
                case "number":
                    if (data == null || data.trim() === "" || !Number.isFinite(Number(data))){
                        console.log(`${data} is not a number. (${name}) (${stationId})`);
                        continue;
                    }
                    report["data"][stationId][name] = Number(data);
                    break;
                default:
                    if (data == null){
                        console.log(`A data is not null. (${name}) (${stationId})`);
                        continue;
                    }
                    report["data"][stationId][name] = data;
                    break;
            }
        }
    });
}

function isInvalidIndex(value, arrayLen){
    return (!Number.isInteger(value) || Number(value) < 0 || Number(value) >= arrayLen)
}