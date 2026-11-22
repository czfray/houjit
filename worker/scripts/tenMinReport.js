import * as Utils from "./utils.js"
import csvLoadDatas from "../data/tenMinReportCsvList.json";

let aliasMap;

export async function fetchTenMinReport(_aliasMap){
    let report = initialiseReport(_aliasMap);
    await Promise.all([
        fetchStnSpecCsvsFromJson(report),
        
        mapGlobalCsvToReport(report,
            "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_15min_uvindex.csv",
            "uv", "number", "zeroIfBlank", 1, null
        ),
    ]);
    return report;
}

function initialiseReport(_aliasMap){
    let report = {};
    aliasMap = _aliasMap;
    report["items"] = {};
    report["data"] = {};
    report["data"]["global"] = {};
    report["data"]["stationSpec"] = {};
    report["data"]["posSpec"] = {};
    return report;
}

async function mapGlobalCsvToReport(report, csvUrl, name, type, note, dataIndex, parent){
    await Utils.processHkoCsv(csvUrl, (dataInLine) => {
        if (isInvalidIndex(dataIndex, dataInLine.length)){
            console.log(`Data index is invalid. (data:${dataIndex}) ${dataInLine} (${name})`);
            return;
        }

        setParent(report, name, parent);

        let data = dataInLine[dataIndex];
        data = checkNote(data, note);
        data = checkType(data, type);

        if (data == null) {
            console.log(`This line did not pass the type check: ${dataInLine} (${name})`);
            return;
        }
        report["data"]["global"][name] = data;
        return;
    });
}

async function fetchStnSpecCsvsFromJson(report){
    await Promise.all(
        csvLoadDatas.map(data => mapStnSpecCsvToReport(report, data.url, data.map))
    );
}

async function mapStnSpecCsvToReport(report, csvUrl, mapping){
    await Utils.processHkoCsv(csvUrl, (dataInLine) => {

        if (!("station" in mapping)) throw new Error("\"station\" is not added to CSV to report mapping.");

        const statonIdIndex = mapping["station"].index;
        if (isInvalidIndex(statonIdIndex, dataInLine.length)) throw new Error(`CSV to report mapping is incorrect: ${statonIdIndex} is not a valid index.`);

        let stationAlias = dataInLine[statonIdIndex];
        if (stationAlias.startsWith('"') && stationAlias.endsWith('"')) stationAlias = stationAlias.slice(1, -1);

        if (!Object.hasOwn(aliasMap, stationAlias)){
            console.warn(stationAlias + " does not have a valid alias map.");
            return;
        }

        if (!Number.isInteger(aliasMap[stationAlias])) throw new Error(stationAlias + "'s alias map is not an integer.");
        const stationId = Number(aliasMap[stationAlias]);

        for (let name of Object.keys(mapping)){

            if (name === "station") continue;

            if (isInvalidIndex(mapping[name].index, dataInLine.length)){
                console.log(`CSV to report mapping is incorrect: ${mapping[name].index} is not a valid index. (${name}, ${dataInLine})`);
                continue;
            }

            setParent(report, name, mapping[name].parent);

            const index = Number(mapping[name].index);
            const type = mapping[name].type;
            let data = dataInLine[index];

            if (data.startsWith('"') && data.endsWith('"')) data = data.slice(1, -1).trim();
            if (data.endsWith("/")) data = data.slice(0, -1).trim();

            if (name === "time") {
                if (report["hkoTime"]) continue;
                report["hkoTime"] = Utils.formatHkoTime(dataInLine[index]);
                continue;
            }

            data = checkNote(data, mapping[name].note);
            data = checkType(data, type);
            if (data == null){
                console.log(`This line did not pass the type check: ${dataInLine} (${name}) (${stationId})`);
                continue;
            }

            if (!report["data"]["stationSpec"][name]) report["data"]["stationSpec"][name] = {};
            report["data"]["stationSpec"][name][stationId] = data;
        }
    });
}

function checkNote(data, note) {
    let newData = data;
    switch (note) {
        case "*end":
            if (newData.endsWith("*")) {
                newData = newData.slice(0, -1).trim();
            }
            break;
        case "kmend":
            if (newData.endsWith("km")) {
                newData = newData.replace("km", "").trim();
            }
            break;
        case "zeroIfBlank":
            if (newData.trim() === "") {
                newData = 0;
            }
            break;
        default:
            break;
    }
    return newData;
}

function checkType(data, type) {
    let newData = data;
    switch (type) {
        case "number":
            if (newData == null || newData.toString().trim() === "" || !Number.isFinite(Number(newData))) {
                console.log(`${newData} is not a number.`);
                return null;
            }
            newData = Number(newData);
            break;
        default:
            if (newData == null || newData === "N/A") {
                console.log(`A data is null or N/A.`);
                return null;
            }
            break;
    }
    return newData;
}

function setParent(report, name, parent) {
    if (parent != null) {
        if (!Object.hasOwn(report["items"], parent)) report["items"][parent] = [];
        if (!report["items"][parent].includes(name)) report["items"][parent].push(name);
    } else {
        if (!Object.hasOwn(report["items"], name)) report["items"][name] = [];
    }
}

function isInvalidIndex(value, arrayLen){
    return (!Number.isInteger(value) || Number(value) < 0 || Number(value) >= arrayLen)
}