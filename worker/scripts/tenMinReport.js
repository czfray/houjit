import * as Utils from "./utils.js"
import csvLoadDatas from "../data/tenMinReportCsvList.json";

let report;
let aliasMap;

export async function fetchTenMinReport(_aliasMap){
    report = {};
    aliasMap = _aliasMap;
    
    await fetchCsvsFromJson();

    return report;
}

async function fetchCsvsFromJson(){
    await Promise.all(
        csvLoadDatas.map(data => mapCsvToReport(data.url, data.map))
    );
}

async function mapCsvToReport(csvUrl, mapping){
    await Utils.processHkoCsv(csvUrl, (dataInLine) => {

        //First look up for stationId
        if (!("station" in mapping)) throw new Error("\"station\" is not added to CSV to report mapping.");

        const statonIdIndex = mapping["station"].index;
        if (isInvalidIndex(statonIdIndex, dataInLine.length)) throw new Error(`CSV to report mapping is incorrect: ${statonIdIndex} is not a valid index.`);

        let stationAlias = dataInLine[statonIdIndex];
        if (stationAlias.startsWith('"') && stationAlias.endsWith('"')) stationAlias = stationAlias.slice(1, -1);

        if (!Object.hasOwn(aliasMap, stationAlias)) throw new Error(stationAlias + " does not have a valid alias map.");
        if (!Number.isInteger(aliasMap[stationAlias])) throw new Error(stationAlias + "'s alias map is not an integer.");
        const stationId = Number(aliasMap[stationAlias]);

        if (!report["data"]) report["data"] = {};
        if (!report["data"][stationId]) report["data"][stationId] = {};

        for (let name of Object.keys(mapping)){

            if (name === "station") continue; //We have extracted the info already

            if (isInvalidIndex(mapping[name].index, dataInLine.length)){
                console.log(`CSV to report mapping is incorrect: ${mapping[name].index} is not a valid index. (${name}, ${dataInLine})`);
                continue;
            }

            const index = Number(mapping[name].index);
            const type = mapping[name].type;
            let data = dataInLine[index];

            if (data.startsWith('"') && data.endsWith('"')) data = data.slice(1, -1);

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
                        data = data.slice(0, -1).trim();
                    }
                    break;
                case "kmend":
                    if (data.endsWith("km")) {
                        data = data.replace("km", "").trim();
                    }
                    break;
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
                    if (data == null || data === "N/A"){
                        console.log(`A data is null or N/A. (${name}) (${stationId})`);
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