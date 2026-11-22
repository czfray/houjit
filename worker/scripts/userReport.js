import * as Utils from "./utils.js";

let stationMap;

export async function fetchUserReport(lat, lon, tenMinReport, _stationMap){
    let report = initialiseReport(_stationMap);
    await Promise.all([
        mapAllGlobalDataToReport(report, tenMinReport),
        mapAllStnSpecDataToReport(report, lat, lon, tenMinReport)
    ]);
    return report;
}

function initialiseReport(_stationMap){
    let report = {};
    stationMap = _stationMap;
    report["data"] = {};
    report["origin"] = {};
    return report;
}

async function mapAllGlobalDataToReport(report, tenMinReport){
    report["hkoTime"] = tenMinReport["hkoTime"];
    report["workerTime"] = tenMinReport["workerTime"];
    for(const dataName of Object.keys(tenMinReport["data"]["global"])){
        report["data"][dataName] = tenMinReport["data"]["global"][dataName];
    }
}

async function mapAllStnSpecDataToReport(report, lat, lon, tenMinReport){
    await Promise.all(
        Object.keys(tenMinReport["data"]["stationSpec"]).map(name => mapStnSpecDataToReport(report, lat, lon, name, tenMinReport))
    );
}

async function mapStnSpecDataToReport(report, lat, lon, name, tenMinReport){
    if (!Object.keys(tenMinReport["items"]).includes(name)) return;

    let minDist;
    let minDistStn;

    for (const stationId of Object.keys(tenMinReport["data"]["stationSpec"][name])){
        const stationData = stationMap["stations"][stationId];
        const stationLat = Number(stationData["coordinates"][0]);
        const stationLon = Number(stationData["coordinates"][1]);

        const stationDistFromUser = Utils.getGpsDistance(lat, lon, stationLat, stationLon);
        if (minDist == null || stationDistFromUser < minDist){
            minDist = stationDistFromUser;
            minDistStn = stationId;
        }
    }

    if (minDistStn == null){
        console.log(`${name} has no data in ten minute report!`);
        return;
    }

    report["data"][name] = tenMinReport["data"]["stationSpec"][name][minDistStn];
    
    report["origin"][name] = {
        "stationId": minDistStn,
        "stationData": stationMap["stations"][minDistStn],
        "distance": minDist,
        "child": tenMinReport["items"][name]
    };

    console.log(`${name} uses data from station ${minDistStn} (${(minDist/1000).toFixed(3)}km).`);

    for (const childName of tenMinReport["items"][name]){
        report["data"][childName] = tenMinReport["data"]["stationSpec"][childName][minDistStn];
        console.log(` - Child ${childName} also uses data from station ${minDistStn}.`);
    }
}