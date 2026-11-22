import * as Utils from "./utils.js";

let report;
let stationMap;

export async function fetchUserReport(lat, lon, tenMinReport, _stationMap){
    initialiseReport(_stationMap);
    await Promise.all([
        mapAllGlobalDataToReport(tenMinReport),
        mapAllStnSpecDataToReport(lat, lon, tenMinReport)
    ]);
    return report;
}

function initialiseReport(_stationMap){
    report = {};
    stationMap = _stationMap;
    report["data"] = {};
}

async function mapAllGlobalDataToReport(tenMinReport){
    report["hkoTime"] = tenMinReport["hkoTime"];
    report["workerTime"] = tenMinReport["workerTime"];
    for(const dataName of Object.keys(tenMinReport["data"]["global"])){
        report["data"][dataName] = tenMinReport["data"]["global"][dataName];
    }
}

async function mapAllStnSpecDataToReport(lat, lon, tenMinReport){
    await Promise.all(
        Object.keys(tenMinReport["data"]["stationSpec"]).map(name => mapStnSpecDataToReport(lat, lon, name, tenMinReport))
    );
}

async function mapStnSpecDataToReport(lat, lon, name, tenMinReport){
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
    console.log(`${name} uses data from station ${minDistStn} (${(minDist/1000).toFixed(3)}km)`);
}

//TODO POS SPEC DATA (RAIN) and station id and name and distance return!
//TODO allow grouping of diff name
//TODO geolocation on app
//TODO request lat an lon validation